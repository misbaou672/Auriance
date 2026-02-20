"""Routes for the Assistant Medical feature."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import logging

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas import (
    AssistantQueryRequest,
    PatientReportRequest,
    TranscriptionResponse,
)
from app.services.nlp_to_sql import nlp_to_sql_service
from app.services.transcription_analyzer import transcription_analyzer
from app.services.report_builder import report_builder
from app.services.db_schema_service import db_schema_service
from app.services.gemini_client import gemini_client
from app.crud.transcription_crud import (
    get_transcription,
    get_user_transcriptions_filtered,
    update_transcription_analysis,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/assistant", tags=["Assistant Medical"])


@router.post("/query")
async def assistant_query(
    request: AssistantQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Process a natural language question about the database."""
    if not gemini_client.is_configured():
        raise HTTPException(status_code=503, detail="Gemini API not configured")

    try:
        result = await nlp_to_sql_service.process_question(
            question=request.question,
            language=request.language,
        )
        return result
    except Exception as e:
        logger.error(f"Assistant query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schema")
async def get_database_schema(
    current_user: User = Depends(get_current_user),
):
    """Return the database schema."""
    return {
        "tables": db_schema_service.get_table_names(),
        "schema": db_schema_service.get_schema_dict(),
    }


@router.post("/transcriptions/{transcription_id}/analyze")
async def analyze_transcription(
    transcription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyze a transcription using Gemini AI."""
    transcription = get_transcription(db, transcription_id)
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    if transcription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    analysis = await transcription_analyzer.analyze(
        text=transcription.text,
        language=transcription.language or "fr",
    )

    update_transcription_analysis(db, transcription_id, analysis)

    return {"transcription_id": transcription_id, **analysis}


@router.get("/transcriptions")
async def get_filtered_transcriptions(
    type_session: Optional[str] = Query(None),
    priorite: Optional[str] = Query(None),
    analysee: Optional[bool] = Query(None),
    patient_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get transcriptions with filters for the assistant view."""
    transcriptions = get_user_transcriptions_filtered(
        db,
        current_user.id,
        type_session=type_session,
        priorite=priorite,
        analysee=analysee,
        patient_id=patient_id,
        skip=skip,
        limit=limit,
    )
    return transcriptions


@router.post("/reports/generate")
async def generate_patient_report(
    request: PatientReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a comprehensive patient report."""
    if not gemini_client.is_configured():
        raise HTTPException(status_code=503, detail="Gemini API not configured")

    try:
        report = await report_builder.generate_patient_report(
            db=db,
            patient_id=request.patient_id,
            user_id=current_user.id,
            report_type=request.report_type,
            date_from=request.date_from,
            date_to=request.date_to,
            format=request.format,
        )

        if "error" in report:
            raise HTTPException(status_code=404, detail=report["error"])

        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/transcriptions/{transcription_id}/link-patient/{patient_id}")
async def link_transcription_to_patient(
    transcription_id: int,
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Link a transcription to a patient."""
    from app.models.patient import Patient

    transcription = get_transcription(db, transcription_id)
    if not transcription or transcription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transcription not found")

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    transcription.patient_id = patient_id
    db.commit()
    db.refresh(transcription)

    return {
        "message": "Transcription linked to patient",
        "transcription_id": transcription_id,
        "patient_id": patient_id,
    }

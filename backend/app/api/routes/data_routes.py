"""Routes for data management (transcriptions, extractions, reports)"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas import (
    TranscriptionResponse, ExtractionResponse, ReportResponse,
    TranscriptionCreate, ExtractionCreate, ReportCreate,
    GeneratedQueryResponse, GeneratedQueryCreate
)
from app.crud import (
    create_transcription, get_user_transcriptions, get_transcription, delete_transcription,
    create_extraction, get_user_extractions, get_extraction, update_extraction,
    create_report, get_user_reports, get_report, delete_report
)
from app.services.vector_db_service import vector_db
from app.services.cache_service import cache
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data", tags=["data"])


# ===== TRANSCRIPTION ROUTES =====
@router.post("/transcriptions", response_model=TranscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_new_transcription(
    transcription: TranscriptionCreate,
    db: Session = Depends(get_db)
):
    """Create a new transcription"""
    # Use default user_id = 1 for development
    user_id = 1
    new_transcription = create_transcription(db, transcription, user_id)
    
    # Add to vector database for semantic search
    try:
        vector_db.add_transcription(
            transcription_id=new_transcription.id,
            text=new_transcription.text,
            metadata={
                "user_id": user_id,
                "language": new_transcription.language,
                "confidence_score": new_transcription.confidence_score,
                "duration_seconds": new_transcription.duration_seconds
            }
        )
        logger.info(f"✅ Added transcription {new_transcription.id} to vector DB")
    except Exception as e:
        logger.error(f"⚠️ Failed to add transcription to vector DB: {e}")
    
    return new_transcription


@router.get("/transcriptions/search/semantic")
async def search_transcriptions(
    query: str = Query(..., description="Search query for semantic search"),
    limit: int = Query(5, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search transcriptions using semantic search"""
    try:
        results = vector_db.search_similar_transcriptions(query, n_results=limit)
        
        # Filter results to only show current user's transcriptions
        user_results = []
        if results and "ids" in results:
            for i, trans_id in enumerate(results["ids"]):
                try:
                    trans_id_int = int(trans_id)
                    transcription = get_transcription(db, trans_id_int)
                    if transcription and transcription.user_id == current_user.id:
                        user_results.append({
                            "transcription": TranscriptionResponse.from_orm(transcription),
                            "similarity_score": results["distances"][i] if i < len(results["distances"]) else 0,
                            "matched_text": results["documents"][i] if i < len(results["documents"]) else ""
                        })
                except (ValueError, IndexError):
                    pass
        
        return {"results": user_results, "query": query}
    except Exception as e:
        logger.error(f"❌ Semantic search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transcriptions", response_model=List[TranscriptionResponse])
async def get_transcriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all transcriptions for default user"""
    user_id = 1
    return get_user_transcriptions(db, user_id, skip, limit)


@router.get("/transcriptions/{transcription_id}", response_model=TranscriptionResponse)
async def get_user_transcription(
    transcription_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific transcription"""
    # Try cache first
    cached = cache.get_cached_transcription(transcription_id)
    if cached:
        logger.info(f"✅ Cache HIT for transcription {transcription_id}")
        return cached
    
    # Get from database
    transcription = get_transcription(db, transcription_id)
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # Cache for future requests
    transcription_dict = TranscriptionResponse.from_orm(transcription).dict()
    cache.cache_transcription(transcription_id, transcription_dict)
    
    return transcription


@router.delete("/transcriptions/{transcription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_transcription(
    transcription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transcription"""
    transcription = get_transcription(db, transcription_id)
    if not transcription or transcription.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # Delete from vector database
    try:
        vector_db.delete_transcription(transcription_id)
        logger.info(f"✅ Deleted transcription {transcription_id} from vector DB")
    except Exception as e:
        logger.error(f"⚠️ Failed to delete from vector DB: {e}")
    
    # Clear cache
    cache.delete(f"transcription:{transcription_id}")
    
    # Delete from SQL database
    delete_transcription(db, transcription_id)
    return None


# ===== EXTRACTION ROUTES =====
@router.post("/extractions", response_model=ExtractionResponse, status_code=status.HTTP_201_CREATED)
async def create_new_extraction(
    extraction: ExtractionCreate,
    db: Session = Depends(get_db)
):
    """Create a new extraction"""
    user_id = 1
    new_extraction = create_extraction(db, extraction, user_id)
    
    # Add to vector database
    try:
        extraction_data = {
            "full_name": new_extraction.full_name,
            "email": new_extraction.email,
            "phone": new_extraction.phone,
            "address": new_extraction.address,
            "form_type": new_extraction.form_type
        }
        vector_db.add_extraction(
            extraction_id=new_extraction.id,
            data=extraction_data,
            metadata={
                "user_id": user_id,
                "transcription_id": new_extraction.transcription_id
            }
        )
        logger.info(f"✅ Added extraction {new_extraction.id} to vector DB")
    except Exception as e:
        logger.error(f"⚠️ Failed to add extraction to vector DB: {e}")
    
    return new_extraction


@router.get("/extractions", response_model=List[ExtractionResponse])
async def get_extractions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all extractions for default user"""
    user_id = 1
    return get_user_extractions(db, user_id, skip, limit)


@router.get("/extractions/{extraction_id}", response_model=ExtractionResponse)
async def get_user_extraction(
    extraction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific extraction"""
    extraction = get_extraction(db, extraction_id)
    if not extraction or extraction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Extraction not found")
    return extraction


@router.put("/extractions/{extraction_id}", response_model=ExtractionResponse)
async def update_user_extraction(
    extraction_id: int,
    extraction_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an extraction"""
    extraction = get_extraction(db, extraction_id)
    if not extraction or extraction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Extraction not found")
    return update_extraction(db, extraction_id, extraction_update)


@router.delete("/extractions/{extraction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_extraction(
    extraction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an extraction"""
    extraction = get_extraction(db, extraction_id)
    if not extraction or extraction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Extraction not found")
    # Delete will cascade via relationship
    from app.crud import delete_extraction
    delete_extraction(db, extraction_id)
    return None


# ===== REPORT ROUTES =====
@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_new_report(
    report: ReportCreate,
    db: Session = Depends(get_db)
):
    """Create a new report"""
    user_id = 1
    return create_report(db, report, user_id)


@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all reports for default user"""
    user_id = 1
    return get_user_reports(db, user_id, skip, limit)


@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_user_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific report"""
    report = get_report(db, report_id)
    if not report or report.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a report"""
    report = get_report(db, report_id)
    if not report or report.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Report not found")
    delete_report(db, report_id)
    return None


# ===== DATABASE STATS =====
@router.get("/stats/databases")
async def get_database_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics for all databases"""
    from app.db.models import Transcription, Extraction, Report
    
    # SQL Database stats
    total_transcriptions = db.query(Transcription).count()
    total_extractions = db.query(Extraction).count()
    total_reports = db.query(Report).count()
    user_transcriptions = db.query(Transcription).filter(Transcription.user_id == current_user.id).count()
    user_extractions = db.query(Extraction).filter(Extraction.user_id == current_user.id).count()
    user_reports = db.query(Report).filter(Report.user_id == current_user.id).count()
    
    # Vector Database stats
    vector_stats = vector_db.get_collection_stats()
    
    # Redis cache status
    redis_status = "enabled" if cache.enabled else "disabled"
    
    return {
        "sql_database": {
            "type": "SQLite",
            "total": {
                "transcriptions": total_transcriptions,
                "extractions": total_extractions,
                "reports": total_reports
            },
            "user": {
                "transcriptions": user_transcriptions,
                "extractions": user_extractions,
                "reports": user_reports
            }
        },
        "vector_database": {
            "type": "ChromaDB",
            "status": "connected",
            "collections": vector_stats
        },
        "cache": {
            "type": "Redis",
            "status": redis_status
        }
    }


# ===== GENERATED QUERIES ROUTES =====
@router.post("/generated-queries", response_model=GeneratedQueryResponse, status_code=status.HTTP_201_CREATED)
async def create_new_generated_query(
    query_data: GeneratedQueryCreate,
    db: Session = Depends(get_db)
):
    """Create a new generated query"""
    from app.db.models import GeneratedQuery
    
    user_id = 1  # Default user for development
    new_query = GeneratedQuery(
        user_id=user_id,
        query_text=query_data.query_text,
        context=query_data.context,
        query_type=query_data.query_type,
        type=query_data.type,
        language=query_data.language
    )
    db.add(new_query)
    db.commit()
    db.refresh(new_query)
    
    return new_query


@router.get("/generated-queries", response_model=List[GeneratedQueryResponse])
async def get_generated_queries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all generated queries for default user"""
    from app.db.models import GeneratedQuery
    
    user_id = 1
    queries = db.query(GeneratedQuery).filter(
        GeneratedQuery.user_id == user_id
    ).order_by(GeneratedQuery.created_at.desc()).offset(skip).limit(limit).all()
    
    return queries


@router.delete("/generated-queries/{query_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_generated_query(
    query_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a generated query"""
    from app.db.models import GeneratedQuery
    
    query = db.query(GeneratedQuery).filter(GeneratedQuery.id == query_id).first()
    if not query or query.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Query not found")
    
    db.delete(query)
    db.commit()
    return None

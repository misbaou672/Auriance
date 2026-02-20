"""Generate comprehensive patient reports using Gemini."""
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.gemini_client import gemini_client
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.db.models import Transcription

logger = logging.getLogger(__name__)


class ReportBuilder:
    """Generates patient reports by aggregating transcriptions and consultations."""

    async def generate_patient_report(
        self,
        db: Session,
        patient_id: int,
        user_id: int,
        report_type: str = "medical",
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        format: str = "markdown",
        language: str = "fr",
    ) -> Dict[str, Any]:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return {"error": f"Patient {patient_id} not found"}

        consultation_query = db.query(Consultation).filter(
            Consultation.patient_id == patient_id
        )
        consultations = consultation_query.order_by(Consultation.id.desc()).all()

        transcription_query = db.query(Transcription).filter(
            Transcription.patient_id == patient_id,
            Transcription.user_id == user_id,
        )
        transcriptions = transcription_query.order_by(
            Transcription.created_at.desc()
        ).all()

        context = self._build_context(patient, consultations, transcriptions)
        report_content = await self._generate_with_gemini(
            context, report_type, format, language
        )

        return {
            "patient_id": patient_id,
            "patient_name": patient.name,
            "report_type": report_type,
            "content": report_content,
            "generated_at": datetime.utcnow().isoformat(),
            "format": format,
            "consultation_count": len(consultations),
            "transcription_count": len(transcriptions),
        }

    def _build_context(self, patient, consultations, transcriptions) -> str:
        parts = [f"Patient: {patient.name}, Age: {patient.age}"]

        for c in consultations[:20]:
            parts.append(
                f"Consultation: Symptomes={c.symptomes}, "
                f"Diagnostic={c.diagnostic}, Traitement={c.traitement}"
            )

        for t in transcriptions[:10]:
            analysis = ""
            if t.analysee and t.resume_ia:
                analysis = f" | Resume IA: {t.resume_ia}"
            parts.append(f"Transcription ({t.created_at}): {t.text[:500]}{analysis}")

        return "\n".join(parts)

    async def _generate_with_gemini(
        self, context: str, report_type: str, format: str, language: str
    ) -> str:
        format_instruction = {
            "markdown": "Formate le rapport en Markdown clair avec titres, listes et sections.",
            "json": "Retourne le rapport en JSON structure.",
            "pdf": "Formate en Markdown (sera converti en PDF ensuite).",
        }.get(format, "Formate en Markdown.")

        type_instruction = {
            "medical": "Genere un rapport medical complet incluant historique, diagnostics et plan de traitement.",
            "summary": "Genere un resume concis de la situation medicale du patient.",
            "chronological": "Genere une chronologie de toutes les consultations.",
        }.get(report_type, "Genere un rapport medical.")

        system_prompt = (
            f"Tu es un redacteur de rapports medicaux. {type_instruction} "
            f"{format_instruction} "
            f"Reponds en {'francais' if language == 'fr' else 'anglais'}. "
            "Sois professionnel, precis et complet."
        )

        try:
            return await gemini_client.chat(
                system_prompt=system_prompt,
                user_message=f"Donnees du patient et consultations:\n\n{context}",
                model=gemini_client.model_smart,
                max_tokens=4000,
            )
        except Exception as e:
            logger.error(f"Report generation error: {e}")
            return f"Erreur de generation du rapport: {e}"


report_builder = ReportBuilder()

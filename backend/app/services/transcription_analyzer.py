"""Analyze transcriptions using Gemini to extract medical insights."""
import logging
from typing import Dict, Any
from app.services.gemini_client import gemini_client

logger = logging.getLogger(__name__)


class TranscriptionAnalyzer:
    """Analyzes transcription text to extract structured medical information."""

    async def analyze(self, text: str, language: str = "fr") -> Dict[str, Any]:
        system_prompt = (
            "Tu es un assistant medical qui analyse des transcriptions de consultations. "
            "Analyse la transcription et extrais les informations structurees. "
            "Reponds en JSON avec exactement ces cles:\n"
            "- resume_ia: Resume concis (2-3 phrases)\n"
            "- points_cles: Tableau de 3-7 points cles\n"
            "- entites_detectees: Objet avec cles 'symptomes', 'diagnostics', "
            "  'medicaments', 'procedures', 'organes' - chacun un tableau\n"
            "- type_session: Un parmi 'consultation', 'urgence', 'suivi', 'chirurgie', 'autre'\n"
            "- priorite: Un parmi 'basse', 'normale', 'haute', 'critique'\n\n"
            f"Reponds en {'francais' if language == 'fr' else 'anglais'}."
        )

        try:
            result = await gemini_client.chat_json(
                system_prompt=system_prompt,
                user_message=f"Transcription a analyser:\n\n{text}",
                model=gemini_client.model_smart,
                temperature=0.1,
            )

            required_keys = [
                "resume_ia", "points_cles", "entites_detectees",
                "type_session", "priorite",
            ]
            for key in required_keys:
                if key not in result:
                    result[key] = self._default_value(key)

            return result
        except Exception as e:
            logger.error(f"Transcription analysis error: {e}")
            return self._fallback_analysis(text)

    def _default_value(self, key: str):
        defaults = {
            "resume_ia": "Analyse non disponible",
            "points_cles": [],
            "entites_detectees": {
                "symptomes": [], "diagnostics": [],
                "medicaments": [], "procedures": [], "organes": [],
            },
            "type_session": "autre",
            "priorite": "normale",
        }
        return defaults.get(key)

    def _fallback_analysis(self, text: str) -> Dict[str, Any]:
        """Basic fallback when Gemini is unavailable."""
        try:
            from app.services.nlp_service import medical_nlp
            info = medical_nlp.extract_medical_info(text)
            return {
                "resume_ia": f"Patient: {info.get('nom_patient', 'N/A')}. "
                             f"Symptomes: {info.get('symptomes', 'N/A')}.",
                "points_cles": [v for v in info.values() if v],
                "entites_detectees": {
                    "symptomes": [s.strip() for s in info.get("symptomes", "").split(",") if s.strip()],
                    "diagnostics": [info.get("diagnostic")] if info.get("diagnostic") else [],
                    "medicaments": [info.get("medicament")] if info.get("medicament") else [],
                    "procedures": [],
                    "organes": [],
                },
                "type_session": "consultation",
                "priorite": "normale",
            }
        except Exception:
            return {
                "resume_ia": "Analyse indisponible",
                "points_cles": [],
                "entites_detectees": {
                    "symptomes": [], "diagnostics": [],
                    "medicaments": [], "procedures": [], "organes": [],
                },
                "type_session": "autre",
                "priorite": "normale",
            }


transcription_analyzer = TranscriptionAnalyzer()

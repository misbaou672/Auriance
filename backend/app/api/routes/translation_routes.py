# app/api/routes/translation_routes.py
"""
Routes API pour la traduction multi-langues
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.translation_service import TranslationService

router = APIRouter(prefix="/translation", tags=["Translation"])


class TranslateRequest(BaseModel):
    """Modèle pour requête de traduction"""

    text: str
    source_language: str = "en"  # Défaut: anglais
    target_language: str  # Obligatoire


class BatchTranslateRequest(BaseModel):
    """Modèle pour traductions multiples"""

    texts: List[str]
    source_language: str = "en"
    target_language: str


class TranscriptionTranslationRequest(BaseModel):
    """Modèle pour traduire une transcription"""

    transcription_text: str
    detected_language: str
    target_language: str


@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """
    Traduit un texte d'une langue à une autre

    Args:
        request: Objet contenant le texte et les langues

    Returns:
        Traduction avec métadonnées
    """
    try:
        service = TranslationService()
        result = await service.translate(
            text=request.text,
            source_language=request.source_language,
            target_language=request.target_language,
        )

        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["error"])

        return {
            "status": "success",
            "data": result,
            "message": "Traduction complétée avec succès",
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur traduction: {e}")
        raise HTTPException(
            status_code=500, detail=f"Erreur lors de la traduction: {str(e)}"
        )


@router.post("/translate-batch")
async def translate_batch(request: BatchTranslateRequest):
    """
    Traduit plusieurs textes en une seule requête

    Args:
        request: Objet contenant liste de textes et langues

    Returns:
        Traductions multiples
    """
    try:
        service = TranslationService()
        result = await service.batch_translate(
            texts=request.texts,
            source_language=request.source_language,
            target_language=request.target_language,
        )

        return {
            "status": "success",
            "data": result,
            "message": f"Traductions: {result['translated']}/{result['total']} réussies",
        }

    except Exception as e:
        print(f"❌ Erreur traduction batch: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la traduction batch: {str(e)}",
        )


@router.post("/translate-transcription")
async def translate_transcription(request: TranscriptionTranslationRequest):
    """
    Traduit une transcription vocale

    Utilisé après la reconnaissance vocale pour traduire le texte transcrit

    Args:
        request: Transcription avec langue détectée et langue cible

    Returns:
        Transcription originale + traduction
    """
    try:
        service = TranslationService()

        # Valider les langues
        if not service.validate_language_code(request.detected_language):
            raise HTTPException(
                status_code=400,
                detail=f"Langue source non supportée: {request.detected_language}",
            )

        if not service.validate_language_code(request.target_language):
            raise HTTPException(
                status_code=400,
                detail=f"Langue cible non supportée: {request.target_language}",
            )

        # Traduire
        result = await service.translate(
            text=request.transcription_text,
            source_language=request.detected_language,
            target_language=request.target_language,
        )

        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["error"])

        return {
            "status": "success",
            "data": {
                "original_text": request.transcription_text,
                "original_language": request.detected_language,
                "translated_text": result.get("translated", ""),
                "target_language": request.target_language,
                "provider": result.get("provider", "unknown"),
                "confidence": result.get("confidence", 0),
                "language_info": {
                    "source": service.get_language_info(request.detected_language),
                    "target": service.get_language_info(request.target_language),
                },
            },
            "message": "Transcription traduite avec succès",
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur traduction transcription: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la traduction: {str(e)}",
        )


@router.get("/languages")
async def get_supported_languages():
    """
    Retourne la liste complète des 25 langues supportées

    Returns:
        Liste des langues avec codes, noms natifs et nombre de locuteurs
    """
    try:
        service = TranslationService()
        languages_data = service.get_supported_languages()

        return {
            "status": "success",
            "data": languages_data,
            "message": f"{languages_data['total']} langues supportées",
        }

    except Exception as e:
        print(f"❌ Erreur récupération langues: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des langues: {str(e)}",
        )


@router.get("/languages/{language_code}")
async def get_language_info(language_code: str):
    """
    Récupère les infos détaillées d'une langue spécifique

    Args:
        language_code: Code ISO de la langue (ex: "fr", "en", "es")

    Returns:
        Infos complètes de la langue
    """
    try:
        service = TranslationService()
        info = service.get_language_info(language_code)

        if not info:
            raise HTTPException(
                status_code=404, detail=f"Langue non supportée: {language_code}"
            )

        return {"status": "success", "data": info}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur infos langue: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des infos: {str(e)}",
        )


@router.get("/health")
async def translation_health_check():
    """Vérification de santé du service de traduction"""
    try:
        service = TranslationService()
        languages = service.get_supported_languages()

        return {
            "status": "healthy",
            "service": "Translation Service",
            "supported_languages": languages["total"],
            "capabilities": [
                "text_translation",
                "batch_translation",
                "transcription_translation",
                "language_detection",
            ],
            "providers": ["google_translate", "libretranslate", "fallback"],
        }

    except Exception as e:
        print(f"❌ Erreur health check traduction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, UploadFile, File, Depends
from services.ai.universal_ai_service import universal_ai_service
from services.ai.aurian_brain import aurian_brain

router = APIRouter(prefix="/api/aurian", tags=["Aurian"])

@router.post("/chat")
async def chat_with_aurian(request: dict):
    """Chat texte avec Aurian"""
    result = await universal_ai_service.process_request({
        'type': 'text',
        'text': request.get('message'),
        'context': request.get('context', {})
    })
    return result

@router.post("/voice")
async def voice_chat_with_aurian(audio_file: UploadFile = File(...)):
    """Chat vocal avec Aurian"""
    audio_data = await audio_file.read()
    
    result = await universal_ai_service.process_request({
        'type': 'voice',
        'audio_data': audio_data,
        'context': {'source': 'voice_chat'}
    })
    return result

@router.get("/capabilities")
async def get_aurian_capabilities():
    """Obtenir les capacités d'Aurian"""
    return {
        'brain': aurian_brain.get_capabilities(),
        'ai_models': universal_ai_service.get_available_models()
    }
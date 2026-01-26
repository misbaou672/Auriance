# app/api/routes/camera_routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(prefix="/camera", tags=["Advanced Camera Analysis"])

# Import différé pour éviter les circulaires
_camera_service = None

def get_camera_service():
    global _camera_service
    if _camera_service is None:
        from app.services.advanced_camera_service import camera_service
        _camera_service = camera_service
    return _camera_service

@router.post("/analyze-face")
async def analyze_face_detailed(file: UploadFile = File(...)):
    """
    Analyse faciale avancée avec OpenCV
    - Détection visage, yeux, sourire
    - Estimation âge, genre, ethnicité
    - Analyse fatigue, émotions, posture
    - Analyse couleurs peau et vêtements
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")
    
    try:
        camera_service = get_camera_service()
        analysis = await camera_service.analyze_face_detailed(file)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")

@router.post("/analyze-posture")
async def analyze_posture(file: UploadFile = File(...)):
    """
    Analyse de la posture corporelle
    """
    try:
        camera_service = get_camera_service()
        analysis = await camera_service.analyze_face_detailed(file)
        return {
            "posture_analysis": analysis.get("posture_analysis", {}),
            "face_detected": "face_detection" in analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")
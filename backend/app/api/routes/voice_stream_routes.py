from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import asyncio
import logging
from app.services.whisper_service import WhisperService

router = APIRouter(prefix="/api/voice-stream", tags=["Streaming STT"])

logger = logging.getLogger(__name__)

@router.websocket("/stt")
async def websocket_stt(websocket: WebSocket):
    """
    WebSocket endpoint for streaming STT (Whisper + Silero VAD).
    Client sends raw audio chunks (PCM 16kHz mono wav or bytes).
    Server streams back partial/final transcriptions.
    """
    await websocket.accept()
    whisper_service = WhisperService()
    audio_chunks = []
    try:
        import time
        last_transcribe = time.time()
        while True:
            data = await websocket.receive_bytes()
            logger.info(f"[WebSocket] Chunk reçu, taille: {len(data)} bytes")
            audio_chunks.append(data)
            now = time.time()
            # Transcrire toutes les 2 secondes ou si beaucoup de chunks
            if (now - last_transcribe > 2 and len(audio_chunks) > 0) or len(audio_chunks) >= 20:
                audio_bytes = b"".join(audio_chunks)
                try:
                    logger.info(f"[WebSocket] Transcription déclenchée, taille totale: {len(audio_bytes)} bytes")
                    result = await whisper_service.transcribe_from_bytes(audio_bytes)
                    await websocket.send_json({
                        "text": result["text"],
                        "language": result.get("language", "unknown"),
                        "is_final": True
                    })
                    audio_chunks = []
                    last_transcribe = now
                except Exception as e:
                    logger.error(f"[WebSocket] Erreur transcription: {e}")
                    await websocket.send_json({"error": str(e)})
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

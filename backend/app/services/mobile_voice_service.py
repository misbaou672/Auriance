# backend/app/services/mobile_voice_service.py
import asyncio
import json
import logging
import numpy as np
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
from datetime import datetime

# Importe tes services existants
from services.voice.whisper_service import WhisperService
from core.database import get_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Auriance Mobile Voice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pour développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MobileVoiceProcessor:
    def __init__(self):
        self.whisper = WhisperService()
        self.active_sessions = {}
        logger.info("✅ Mobile Voice Processor initialized")
    
    async def process_realtime_stream(self, websocket: WebSocket, session_id: str, language: str = "fr"):
        """Traite le streaming audio en temps réel pour mobile"""
        audio_buffer = []
        transcription_history = []
        
        try:
            # Envoyer confirmation de session
            await websocket.send_json({
                "type": "session_start",
                "session_id": session_id,
                "language": language,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            while True:
                # Recevoir chunk audio du mobile
                data = await asyncio.wait_for(
                    websocket.receive_bytes(),
                    timeout=1.0
                )
                
                # Convertir en numpy array
                audio_chunk = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
                audio_buffer.append(audio_chunk)
                
                # Traiter toutes les 1.5 secondes
                if len(audio_buffer) >= 3:  # 3 chunks de 0.5s
                    audio_concat = np.concatenate(audio_buffer)
                    
                    # Transcrire avec Whisper
                    result = await self.whisper.transcribe_audio(
                        audio_concat,
                        language=language
                    )
                    
                    if result.get("text", "").strip():
                        # Envoyer transcription partielle
                        await websocket.send_json({
                            "type": "transcription",
                            "text": result["text"],
                            "confidence": result.get("confidence", 0.0),
                            "is_final": False,
                            "timestamp": datetime.utcnow().isoformat()
                        })
                        
                        transcription_history.append(result["text"])
                    
                    # Vider buffer
                    audio_buffer.clear()
                    
        except WebSocketDisconnect:
            logger.info(f"Session {session_id} ended")
            
            # Envoyer transcription finale
            if transcription_history:
                final_text = " ".join(transcription_history)
                await websocket.send_json({
                    "type": "final_transcription",
                    "text": final_text,
                    "total_chunks": len(transcription_history),
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # Sauvegarder en base
                await self._save_transcription(session_id, final_text, language)
                
        except Exception as e:
            logger.error(f"Error in session {session_id}: {e}")
    
    async def _save_transcription(self, session_id: str, text: str, language: str):
        """Sauvegarde la transcription en base de données"""
        try:
            conn = get_db_connection()
            if conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO consultations 
                        (transcription_audio, langue_detectee, created_at)
                        VALUES (%s, %s, NOW())
                    """, (text, language))
                    conn.commit()
                conn.close()
        except Exception as e:
            logger.error(f"Error saving transcription: {e}")

processor = MobileVoiceProcessor()

@app.websocket("/ws/mobile/voice")
async def mobile_voice_websocket(websocket: WebSocket, language: str = "fr"):
    await websocket.accept()
    
    session_id = str(uuid.uuid4())
    logger.info(f"📱 Mobile session started: {session_id}")
    
    try:
        await processor.process_realtime_stream(websocket, session_id, language)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

@app.get("/mobile/health")
async def mobile_health():
    return {
        "status": "healthy",
        "service": "mobile-voice-api",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/mobile/languages")
async def mobile_languages():
    return {
        "languages": [
            {"code": "fr", "name": "Français", "native": "Français"},
            {"code": "en", "name": "English", "native": "English"},
            {"code": "es", "name": "Español", "native": "Español"},
            {"code": "de", "name": "Deutsch", "native": "Deutsch"},
            {"code": "it", "name": "Italiano", "native": "Italiano"},
            {"code": "zh", "name": "中文", "native": "中文"},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
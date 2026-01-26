# backend/app/api/routes/voice_routes.py - AJOUTE CES FONCTIONS:

from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import uuid
from datetime import datetime

# ... ton code existant ...

@router.websocket("/mobile/voice-stream")
async def mobile_voice_stream(websocket: WebSocket, language: str = "fr"):
    """WebSocket pour streaming audio mobile"""
    await websocket.accept()
    
    session_id = str(uuid.uuid4())
    
    try:
        # Initialiser la session
        await websocket.send_json({
            "type": "session_start",
            "session_id": session_id,
            "language": language
        })
        
        audio_buffer = []
        
        while True:
            # Recevoir audio du mobile
            data = await websocket.receive_bytes()
            
            # Utiliser ton service Whisper existant
            from services.voice.whisper_service import WhisperService
            whisper = WhisperService()
            
            # Transcrire (simplifié pour l'exemple)
            # Tu dois adapter avec ton vrai code Whisper
            text = await whisper.transcribe_audio_chunk(data, language)
            
            # Envoyer la transcription
            await websocket.send_json({
                "type": "transcription",
                "text": text,
                "is_final": False
            })
            
    except WebSocketDisconnect:
        print(f"Mobile session {session_id} disconnected")
    except Exception as e:
        print(f"Error: {e}")
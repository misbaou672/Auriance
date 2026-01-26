# backend/app/api/routes/aurian_enhanced_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import asyncio

from services.aurian_unified import aurian_unified
from services.aurian_enhanced_brain import aurian_enhanced_brain

router = APIRouter(prefix="/aurian", tags=["Aurian Enhanced"])

class ChatRequest(BaseModel):
    message: str
    language: str = "fr"

class ChatResponse(BaseModel):
    user_message: str
    aurian_response: str
    topic: str
    language: str
    source: str

@router.post("/chat", response_model=ChatResponse)
async def enhanced_chat(request: ChatRequest):
    """Nouveau endpoint avec base de données"""
    try:
        # Utilise notre service unifié (qui utilise TON API OpenAI)
        response = await aurian_unified.chat(request.message, request.language)
        
        # Sauvegarde en base de données
        aurian_enhanced_brain.save_conversation(
            request.message, response, request.language
        )
        
        # Détection du topic
        topic = aurian_enhanced_brain.detect_topic(request.message)
        
        return ChatResponse(
            user_message=request.message,
            aurian_response=response,
            topic=topic,
            language=request.language,
            source="Aurian Enhanced + OpenAI"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Aurian: {str(e)}")

@router.get("/conversations")
async def get_conversations(limit: int = 20):
    """Récupère toutes les conversations de la base de données"""
    try:
        import sqlite3
        conn = sqlite3.connect('aurian_conversations.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_message, aurian_response, topic, language, timestamp
            FROM conversations 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        
        conversations = cursor.fetchall()
        conn.close()
        
        return {
            "total": len(conversations),
            "conversations": [
                {
                    "user_message": conv[0],
                    "aurian_response": conv[1],
                    "topic": conv[2],
                    "language": conv[3],
                    "timestamp": conv[4]
                }
                for conv in conversations
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur DB: {str(e)}")

@router.get("/medical-advice/{symptom}")
async def get_medical_advice(symptom: str):
    """Récupère des conseils médicaux spécifiques"""
    try:
        import sqlite3
        conn = sqlite3.connect('aurian_conversations.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT symptom, advice, urgency_level, category
            FROM medical_knowledge 
            WHERE ? LIKE '%' || symptom || '%'
            LIMIT 3
        ''', (symptom.lower(),))
        
        results = cursor.fetchall()
        conn.close()
        
        return {
            "symptom": symptom,
            "advice_found": len(results),
            "advices": [
                {
                    "symptom": res[0],
                    "advice": res[1],
                    "urgency": res[2],
                    "category": res[3]
                }
                for res in results
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur DB: {str(e)}")
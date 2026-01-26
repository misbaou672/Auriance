from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
import requests
import logging

router = APIRouter(prefix="/api/auriance/chat", tags=["Chatbot"])
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "gemini-1.5-pro"  # Default to Pro

@router.post("/")
async def chat_with_gemini(request: ChatRequest):
    """
    Chat avec Google Gemini Pro (via REST API).
    Nécessite la clé GEMINI_API_KEY dans .env
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Fallback Mock si pas de clé pour éviter le crash démo
        logger.warning("⚠️ GEMINI_API_KEY manquant. Mode Mock activé.")
        return {
            "role": "assistant",
            "content": "Je suis configuré pour utiliser Gemini Pro, mais je ne trouve pas la clé API (GEMINI_API_KEY) dans le fichier .env. Veuillez l'ajouter pour activer mon vrai cerveau ! 🧠"
        }

    try:
        # Construction du payload pour Gemini
        # Gemini API format: contents: [{ role: "user"|"model", parts: [{ text: "..." }] }]
        gemini_contents = []
        for msg in request.messages:
            role = "user" if msg.role == "user" else "model"
            gemini_contents.append({
                "role": role,
                "parts": [{"text": msg.content}]
            })

        # System Instruction (Context Project)
        # Note: 'system_instruction' param is supported in v1beta models
        system_instruction = {
            "role": "user", 
            "parts": [{ "text": """
            Tu es l'Assistant Expert du projet AURIANCE.
            Ton rôle est d'aider l'utilsateur, de répondre aux questions techniques (React, Python, Whisper), 
            et de guider pour les démos (Bio-Scan, Eco-Scan).
            
            Infos clés:
            - Bio-Scan: Visualisation SVG temps réel, mots-clés qui allument les parties du corps.
            - Eco-Scan: Mode plante (racines, feuilles) accessible via bouton ECO.
            - Tech Stack: React + Vite, Python FastAPI, Whisper (STT), PostgreSQL.
            - Fonctionnalités: Transcription Live, Historique, Export PDF, RAG.
            
            Sois concis, professionnel et techniquement précis.
            """ }]
        }
        
        # Ajout du system instruction au début (trick pour compatibilité simple)
        # Pour le vrai param system_instruction, il faut l'API v1beta/models/...:generateContent
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={api_key}"
        
        payload = {
            "contents": gemini_contents,
            "systemInstruction": {
                "parts": [{ "text": "Tu es l'Assistant Expert Auriance." }]
            }
        }
        
        # Si systemInstruction bug (parfois 400 sur certains modèles), on le met dans le prompt.
        # On tente sans systemInstruction d'abord pour gemini-pro standard, ou avec pour 1.5.
        # Utilisons une approche hybride robuste.
        
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        
        if response.status_code != 200:
            logger.error(f"Gemini API Error: {response.text}")
            return {
                "role": "assistant",
                "content": f"Désolé, une erreur est survenue avec Gemini: {response.status_code}"
            }
            
        data = response.json()
        
        # Extraction réponse
        try:
            ai_text = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"role": "assistant", "content": ai_text}
        except (KeyError, IndexError) as e:
            logger.error(f"Gemini Parse Error: {data}")
            return {"role": "assistant", "content": "J'ai reçu une réponse vide de Gemini."}

    except Exception as e:
        logger.error(f"Global Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

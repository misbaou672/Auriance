import openai
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

# Configuration directe OpenAI
openai.api_key = "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"

router = APIRouter()

# ========== NOUVELLE ROUTE DIRECTE OPENAI ==========
@router.get("/chat/direct")
async def chat_with_ai_direct(message: str = Query(..., description="Message à envoyer à OpenAI")):
    """Solution directe avec OpenAI - Test immédiat"""
    try:
        print(f"🎯 Appel direct OpenAI avec: {message}")
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system", 
                    "content": """Tu es Aurian, un assistant santé expert et bienveillant.
                    Règles importantes :
                    - Sois précis et clair
                    - Recommande de consulter un médecin pour les problèmes sérieux
                    - Donne des conseils pratiques et sécuritaires
                    - Utilise un ton rassurant et empathique
                    - Pour les urgences, dis immédiatement de consulter un médecin"""
                },
                {
                    "role": "user", 
                    "content": message
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        ai_response = response.choices[0].message.content
        print(f"✅ Réponse OpenAI reçue!")
        
        return {
            "user_message": message,
            "ai_response": ai_response,
            "source": "OpenAI GPT-4 Direct",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Erreur OpenAI direct: {str(e)}")
        return {
            "user_message": message,
            "ai_response": f"Je comprends: '{message}'. Pour une réponse médicale précise, veuillez consulter un professionnel de santé.",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# ========== ROUTE EXISTANTE (pour compatibilité) ==========
@router.get("/chat")
async def chat_with_ai_old(message: str = Query(..., description="Message à envoyer à l'IA")):
    """Ancienne route - utilise maintenant OpenAI aussi"""
    try:
        print(f"🔵 Ancienne route appelée avec: {message}")
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system", 
                    "content": "Tu es Aurian, assistant santé. Réponds de façon bienveillante et précise."
                },
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=400
        )
        
        ai_response = response.choices[0].message.content
        
        return {
            "user_message": message,
            "ai_response": ai_response,
            "source": "OpenAI GPT-4",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "user_message": message,
            "ai_response": f"Bonjour ! Je suis Aurian. Vous dites: '{message}'. Comment puis-je vous aider?",
            "timestamp": datetime.now().isoformat()
        }

@router.get("/health")
async def ai_health_check():
    return {
        "status": "healthy", 
        "service": "OpenAI Direct Integration",
        "timestamp": datetime.now().isoformat()
    }
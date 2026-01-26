# backend/app/api/routes/universal_ai_routes.py
import openai
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime

# Configuration OpenAI
openai.api_key = "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"

router = APIRouter()

@router.get("/universal-chat")
async def universal_chat(message: str = Query(..., description="Message à envoyer à l'IA Universelle")):
    """Chat universel avec OpenAI - MODÈLE CORRIGÉ"""
    try:
        print(f"🚀 APPEL OPENAI - Message: {message}")
        
        # Utilise gpt-3.5-turbo au lieu de gpt-4
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # ⬅️ CHANGÉ ICI
            messages=[
                {
                    "role": "system", 
                    "content": """Tu es Aurian, un assistant santé expert et bienveillant.

RÈGLES IMPORTANTES :
- Sois précis et utile
- Pour les problèmes de santé, recommande de consulter un médecin
- Donne des conseils pratiques et sécuritaires
- Utilise un ton empathique et professionnel
- Pour les urgences, dis immédiatement d'appeler le 15

⚠️ Mentionne que tu n'es pas un médecin."""
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
        print(f"✅ RÉPONSE OPENAI RÉUSSIE!")
        print(f"📝 Réponse: {ai_response}")
        
        return {
            "user_message": message,
            "universal_ai_response": ai_response,
            "timestamp": datetime.now().isoformat(),
            "source": "OpenAI GPT-3.5-Turbo"
        }
        
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
        return {
            "user_message": message,
            "universal_ai_response": f"Bonjour ! Pour '{message}', je recommande de consulter un professionnel de santé pour des conseils personnalisés.",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@router.get("/test-openai")
async def test_openai(message: str = Query("Test santé", description="Message de test")):
    """Route de test OpenAI - MODÈLE CORRIGÉ"""
    try:
        print(f"🧪 TEST OPENAI - Message: {message}")
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # ⬅️ CHANGÉ ICI
            messages=[
                {"role": "user", "content": f"Réponds brièvement à: {message}"}
            ],
            max_tokens=200
        )
        
        ai_response = response.choices[0].message.content
        
        return {
            "test": "SUCCÈS",
            "message": message,
            "openai_response": ai_response,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "test": "ÉCHEC",
            "message": message,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/test-connection")
async def test_connection():
    """Test de connexion simple"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # ⬅️ CHANGÉ ICI
            messages=[{"role": "user", "content": "Dis juste 'OK'"}],
            max_tokens=10
        )
        return {"status": "SUCCESS", "response": response.choices[0].message.content}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}
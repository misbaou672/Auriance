from fastapi import APIRouter, HTTPException
from app.core.settings import settings
import httpx

router = APIRouter(prefix="/api/aurian", tags=["Aurian Health AI"])

# Prompt système pour la santé
HEALTH_SYSTEM_PROMPT = """
TU ES AURIAN - ASSISTANT IA MÉDICAL

⚠️ **RÈGLES STRICTES :**
- INFORMATION ÉDUCATIVE UNIQUEMENT
- NE FAIS JAMAIS DE DIAGNOSTIC
- NE PRESCRIS JAMAIS DE TRAITEMENT
- ORIENTE VERS LES URGENCES SI NÉCESSAIRE

✅ **DOMAINES AUTORISÉS :**
- Explications de concepts médicaux
- Informations sur les médicaments
- Orientation professionnelle
- Rappels de prévention

🚨 **URGENCES :** Si symptômes graves → "COMPOSEZ LE 15 IMMÉDIATEMENT"
"""

@router.post("/chat")
async def health_chat(message: str):
    """Endpoint de chat santé de base"""
    try:
        # Vérification des urgences
        emergency_keywords = [
            "crise cardiaque", "avc", "étouffe", "difficulté respiratoire", 
            "hémorragie", "inconscient", "douleur thoracique"
        ]
        
        message_lower = message.lower()
        if any(urgence in message_lower for urgence in emergency_keywords):
            return {
                "user_message": message,
                "ai_response": "🚨 URGENCE MÉDICALE - Composez immédiatement le 15 (SAMU) ou le 112",
                "priority": "high",
                "action_required": "appeler_urgences"
            }
        
        # Appel à OpenAI
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": HEALTH_SYSTEM_PROMPT},
                        {"role": "user", "content": f"Question santé : {message}"}
                    ],
                    "max_tokens": settings.MAX_RESPONSE_TOKENS,
                    "temperature": settings.AI_TEMPERATURE
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data["choices"][0]["message"]["content"]
                
                return {
                    "user_message": message,
                    "ai_response": ai_response,
                    "type": "health_education",
                    "disclaimer": "Information éducative uniquement - Consultez un professionnel de santé"
                }
            else:
                return {
                    "user_message": message,
                    "ai_response": "Je suis en maintenance temporaire. Pour toute question médicale, consultez un professionnel de santé.",
                    "type": "fallback"
                }
                
    except Exception as e:
        return {
            "user_message": message,
            "ai_response": "Service temporairement indisponible. Veuillez consulter un médecin pour toute question médicale.",
            "error": "service_unavailable"
        }

@router.get("/info")
async def aurian_info():
    """Information sur Aurian"""
    return {
        "name": "Aurian Health AI",
        "version": "1.0",
        "description": "Assistant IA médical éducatif",
        "capabilities": [
            "Information médicale éducative",
            "Orientation professionnelle", 
            "Détection d'urgences médicales"
        ],
        "limitations": [
            "Ne remplace pas un médecin",
            "Ne fait pas de diagnostic",
            "Ne prescrit pas de traitement"
        ]
    }
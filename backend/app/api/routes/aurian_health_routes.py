# backend/app/api/routes/aurian_health_routes.py
import logging
import time
import openai
from fastapi import APIRouter, Depends, Query
from typing import Dict, Any
from datetime import datetime

# Configuration OpenAI
openai.api_key = "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"

# --- ROUTER ---
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post(
    "/api/aurian/health-chat",
    tags=["Santé"],
    summary="Chat santé spécialisé avec Aurian (OpenAI réel)"
)
async def aurian_health_chat(
    message: str = Query(..., description="Le message ou symptôme de l'utilisateur (ex: j'ai mal à la gorge)")
) -> Dict[str, Any]:
    """
    Endpoint pour la conversation IA de santé avec OpenAI GPT-4.
    
    Cette route utilise OpenAI pour fournir des réponses médicales intelligentes
    et sécuritaires.
    """
    
    logger.info(f"🏥 AURIAN HEALTH AI - Début traitement: '{message}'")
    start_time = time.time()
    
    try:
        print(f"🔍 Health Chat - Analyse du symptôme: {message}")
        
        # Détection d'urgence
        message_lower = message.lower()
        urgences = [
            'douleur poitrine', 'douleur thoracique', 'essoufflé', 'essoufflement',
            'difficulté respiratoire', 'oppression', 'crise cardiaque', 'avc',
            'paralysie', 'faiblesse soudaine', 'saignement abondant', 'brûlure grave'
        ]
        
        is_urgence = any(urgence in message_lower for urgence in urgences)
        
        # Construction du prompt médical
        if is_urgence:
            system_prompt = """🚨 URGENCE MÉDICALE - ASSISTANT CRITIQUE

Tu es Aurian, assistant médical d'urgence. La situation semble critique.

RÈGLES URGENCE :
1. Demandez IMMÉDIATEMENT d'appeler les urgences (15 en France, 112 en Europe)
2. Ne donnez PAS de conseils de traitement
3. Dites de rester calme et d'attendre les secours
4. Ne déplacez pas la personne si traumatisme
5. Vérifiez si la personne respire

Répondez de façon URGENTE et CLAIRE."""
        else:
            system_prompt = """🏥 AURIAN - ASSISTANT SANTÉ EXPERT

Tu es Aurian, assistant santé bienveillant et professionnel.

RÈGLES IMPORTANTES :
- Écoutez et soyez empathique
- Analysez les symptômes avec prudence
- RECOMMANDEZ TOUJOURS de consulter un médecin pour diagnostic
- Donnez des conseils généraux et sécuritaires
- Mentionnez que vous n'êtes pas un médecin
- Pour la fièvre, douleurs, symptômes persistants : CONSULTATION MÉDICALE
- Proposez des mesures de confort en attendant le médecin

⚠️ IMPORTANT : Ces conseils ne remplacent pas une consultation médicale."""

        # Appel OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system", 
                    "content": system_prompt
                },
                {
                    "role": "user", 
                    "content": f"Question santé: {message}"
                }
            ],
            temperature=0.7,
            max_tokens=600
        )
        
        ai_response = response.choices[0].message.content
        print(f"✅ Réponse santé OpenAI générée!")
        
        # Détermination du niveau d'urgence
        if is_urgence:
            urgency_level = "high"
            response_type = "urgence_medicale"
        elif any(symptom in message_lower for symptom in ['fièvre', 'douleur', 'nausée', 'vomissement', 'fatigue']):
            urgency_level = "medium"
            response_type = "conseil_medical"
        else:
            urgency_level = "low" 
            response_type = "information_sante"

        return {
            "user_message": message,
            "aurian_response": {
                "response": ai_response,
                "context": "sante_professionnel",
                "type": response_type,
                "urgency_level": urgency_level,
                "is_emergency": is_urgence
            },
            "timestamp": datetime.now().isoformat(),
            "response_time": f"{time.time() - start_time:.2f}s"
        }
        
    except Exception as e:
        logger.error(f"💥 ERREUR Health Chat: {e}")
        return {
            "user_message": message,
            "aurian_response": {
                "response": f"🔧 Service temporairement indisponible. Pour '{message}', veuillez consulter un professionnel de santé pour une évaluation précise.",
                "context": "erreur_technique",
                "type": "information",
                "urgency_level": "low",
                "is_emergency": False
            },
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@router.get(
    "/api/aurian/emergency-protocols",
    tags=["Santé"],
    summary="Protocoles d'urgence médicale"
)
async def get_emergency_protocols():
    """Liste des protocoles d'urgence"""
    return {
        "protocols": {
            "arrêt_cardiaque": "Appeler le 15 - Massage cardiaque - DAE si disponible",
            "AVC": "Appeler le 15 - Noter l'heure début symptômes - Allonger la personne",
            "difficulté_respiratoire": "Appeler le 15 - Position assise - Ne pas allonger",
            "brûlure_grave": "Appeler le 15 - Refroidir à l'eau - Ne pas percer les cloques",
            "hémorragie": "Appeler le 15 - Compression directe - Allonger la personne",
            "traumatisme": "Appeler le 15 - Immobiliser - Ne pas déplacer"
        },
        "numéros_urgence": {
            "France": "15 (SAMU) ou 112",
            "Europe": "112", 
            "Pompiers": "18",
            "Police": "17"
        },
        "timestamp": datetime.now().isoformat()
    }

@router.post(
    "/api/aurian/voice/transcribe-medical",
    tags=["Vocal Santé"],
    summary="Transcription audio médicale"
)
async def transcribe_medical_audio():
    """Transcription spécialisée pour contenu médical"""
    return {
        "status": "service_en_development",
        "message": "Fonction de transcription médicale en cours de développement",
        "timestamp": datetime.now().isoformat()
    }

@router.post(
    "/api/aurian/voice/medical-conversation", 
    tags=["Vocal Santé"],
    summary="Conversation vocale médicale"
)
async def medical_voice_conversation():
    """Conversation vocale spécialisée santé"""
    return {
        "status": "service_en_development", 
        "message": "Conversation vocale médicale en cours de développement",
        "timestamp": datetime.now().isoformat()
    }

@router.post(
    "/api/aurian/voice/speak-medical",
    tags=["Vocal Santé"], 
    summary="Synthèse vocale médicale"
)
async def speak_medical_text():
    """Synthèse vocale pour contenu médical"""
    return {
        "status": "service_en_development",
        "message": "Synthèse vocale médicale en cours de développement",
        "timestamp": datetime.now().isoformat()
    }

@router.get(
    "/api/aurian/health-status",
    tags=["Santé"],
    summary="Statut du service santé Aurian"
)
async def health_status():
    """Vérification du service santé"""
    return {
        "service": "Aurian Health AI",
        "status": "active",
        "openai_integration": "active",
        "emergency_detection": "active",
        "features": [
            "Chat santé intelligent",
            "Détection d'urgence", 
            "Conseils médicaux sécuritaires",
            "Protocoles d'urgence",
            "Support multilingue"
        ],
        "timestamp": datetime.now().isoformat()
    }
# backend/app/core/aurian_engine.py
class AurianEngine:
    def __init__(self):
        pass
    
    def detect_intent(self, message: str, user_lang: str = "fr") -> dict:
        """Détection d'intention simplifiée"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["mal", "santé", "docteur", "fièvre", "tête"]):
            return {"intent": "medical_advice", "confidence": 0.9}
        elif any(word in message_lower for word in ["rdv", "planning", "horaire"]):
            return {"intent": "planning", "confidence": 0.8}
        else:
            return {"intent": "general", "confidence": 0.7}
    
    def generate_professional_response(self, message: str, intent: str, user_lang: str) -> str:
        """Réponse simple en attendant Ollama"""
        responses = {
            "medical_advice": "Pour des conseils de bien-être, je recommande de consulter un professionnel de santé.",
            "planning": "Je peux vous aider à optimiser votre planning. Décrivez-moi vos besoins.",
            "general": f"J'ai bien reçu votre message : '{message}'. Comment puis-je vous aider?"
        }
        return responses.get(intent, "Je suis là pour vous aider.")

# Instance globale
aurian_engine = AurianEngine()
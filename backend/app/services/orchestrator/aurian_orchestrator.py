import logging
from typing import Dict, Optional
import asyncio

from services.voice.speech_engine import SpeechRecognitionEngine, SpeechEngineType
from services.ai.mistral_service import mistral_service
from services.orchestrator.aurian_orchestrator import aurian_orchestrator

logger = logging.getLogger(__name__)

class AurianOrchestrator:
    """
    Orchestrateur principal inspiré de l'architecture Handy
    Gère le flux: Audio → Transcription → IA → Action
    """
    
    def __init__(self):
        self.speech_engine = SpeechRecognitionEngine()
        self.conversation_context = {}
    
    async def process_voice_command(self, 
                                  audio_data: bytes,
                                  context: Dict = None) -> Dict:
        """
        Traiter une commande vocale complète comme Handy
        """
        try:
            # Étape 1: Transcription vocale
            transcription_result = await self.speech_engine.transcribe_audio(
                audio_data=audio_data,
                language="fr"
            )
            
            if not transcription_result['success']:
                return {
                    'success': False,
                    'error': 'Erreur transcription',
                    'transcription_result': transcription_result
                }
            
            user_text = transcription_result['text']
            
            # Étape 2: Compréhension par l'IA
            ai_response = await self._process_with_ai(
                user_text=user_text,
                context=context
            )
            
            # Étape 3: Exécution d'actions si nécessaire
            action_result = await self._execute_actions(ai_response, context)
            
            return {
                'success': True,
                'transcription': transcription_result,
                'ai_response': ai_response,
                'actions': action_result,
                'engine_used': transcription_result['engine']
            }
            
        except Exception as e:
            logger.error(f"Erreur traitement commande vocale: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _process_with_ai(self, user_text: str, context: Dict = None) -> Dict:
        """Traiter le texte avec Mistral"""
        messages = [
            {
                "role": "system",
                "content": "Tu es Aurian, assistant vocal intelligent. Sois concis et naturel."
            },
            {
                "role": "user", 
                "content": user_text
            }
        ]
        
        try:
            response = mistral_service.chat_completion(
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return {
                'text': response['content'],
                'intent': self._extract_intent(response['content']),
                'needs_action': self._requires_action(response['content']),
                'usage': response['usage']
            }
            
        except Exception as e:
            logger.error(f"Erreur traitement IA: {e}")
            return {
                'text': "Désolé, je rencontre des difficultés techniques.",
                'intent': 'error',
                'needs_action': False,
                'error': str(e)
            }
    
    async def _execute_actions(self, ai_response: Dict, context: Dict = None) -> Dict:
        """Exécuter des actions basées sur la réponse IA"""
        actions = []
        
        # Exemple: Insertion dans une application (comme Handy)
        if ai_response.get('needs_action') and context:
            if context.get('target_app') == 'text_editor':
                actions.append({
                    'type': 'insert_text',
                    'content': ai_response['text'],
                    'target': context['target_app']
                })
        
        return {'executed_actions': actions}
    
    def _extract_intent(self, text: str) -> str:
        """Extraire l'intention du texte (simplifié)"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['écris', 'rédige', 'note']):
            return 'write_text'
        elif any(word in text_lower for word in ['cherche', 'recherche']):
            return 'search'
        elif any(word in text_lower for word in ['rappelle', 'souviens']):
            return 'reminder'
        else:
            return 'conversation'
    
    def _requires_action(self, text: str) -> bool:
        """Déterminer si la réponse nécessite une action"""
        return self._extract_intent(text) in ['write_text', 'search']
    
    def get_engine_info(self) -> Dict:
        """Obtenir les informations des moteurs disponibles"""
        return {
            'available_engines': self.speech_engine.get_available_engines(),
            'default_engine': self.speech_engine.default_engine.value,
            'hardware': self._get_hardware_info()
        }
    
    def _get_hardware_info(self) -> Dict:
        """Obtenir les informations hardware"""
        import psutil
        import torch
        
        return {
            'cpu_cores': psutil.cpu_count(),
            'ram_gb': psutil.virtual_memory().total / (1024**3),
            'gpu_available': torch.cuda.is_available(),
            'gpu_count': torch.cuda.device_count() if torch.cuda.is_available() else 0
        }


# Instance globale
aurian_orchestrator = AurianOrchestrator()
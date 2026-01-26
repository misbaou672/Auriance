import os
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class RealLLMService:
    def __init__(self):
        # Utilise l'API OpenAI-compatible (OpenAI ou DeepSeek).
        self.api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        self.model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        self.mock_mode = os.getenv("LLM_MOCK_MODE", "false").lower() == "true"

    async def generate_health_response(
        self,
        user_query: str,
        context: str = "",
        target_language: str = "fr",
        original_question: Optional[str] = None,
        context_meta: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Génère une réponse structurée (multilingue) en s'appuyant sur un LLM."""
        api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or self.api_key
        base_url = os.getenv("LLM_BASE_URL", self.base_url)
        model = os.getenv("LLM_MODEL", self.model)
        mock_mode = os.getenv("LLM_MOCK_MODE", "false").lower() == "true" or self.mock_mode

        # Mode mock pour tests
        if mock_mode:
            logger.info("🎭 Mode mock activé")
            return self._generate_mock_response(user_query, context)

        if not api_key:
            logger.error("Aucune clé LLM fournie (LLM_API_KEY/OPENAI_API_KEY)")
            logger.info("💡 Active LLM_MOCK_MODE=true pour tester sans clé")
            return self._generate_mock_response(user_query, context)

        context_meta = context_meta or {}
        target_language = target_language or "fr"

        system_prompt = (
            f"Tu es Aurian, assistant professionnel et bienveillant. Réponds en {target_language}. "
            "Structure systématiquement la réponse en quatre blocs clairs :\n"
            "1) Réponse directe (3-5 phrases, concise)\n"
            "2) Détails et sources : mentionne ce qui vient du contexte interne; si aucune donnée interne, dis-le clairement\n"
            "3) Plan d'action / étapes concrètes\n"
            "4) Avertissements / limites (sécurité, consulter un pro si nécessaire)\n"
            "Si la question est hors du domaine habituel, réponds quand même de façon utile et polie, en précisant que tu t'appuies sur des connaissances générales."
        )

        try:
            async with httpx.AsyncClient() as client:
                messages = [
                    {"role": "system", "content": system_prompt},
                ]

                context_block = context or "Aucune source interne trouvée. Réponds avec prudence."
                meta_block = (
                    f"meta_context: {context_meta.get('qdrant_hits', 0)} qdrant / "
                    f"{context_meta.get('postgres_hits', 0)} postgres / "
                    f"{context_meta.get('neo4j_hits', 0)} neo4j / "
                    f"context_used={context_meta.get('context_used', False)}"
                )

                user_payload = (
                    f"Question originale: {original_question or user_query}\n"
                    f"Question utilisée pour la recherche: {user_query}\n"
                    f"{meta_block}\n"
                    f"Contexte interne:\n{context_block}\n"
                    "Fournis la réponse structurée demandée."
                )

                messages.append({"role": "user", "content": user_payload})

                response = await client.post(
                    f"{base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "temperature": 0.2,
                        "max_tokens": 800,
                    },
                    timeout=30.0,
                )

                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    error_msg = f"Erreur API: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    logger.error(f"URL utilisée: {base_url}, Modèle: {model}")
                    # Fallback vers mock en cas d'erreur quota
                    if response.status_code == 429:
                        logger.warning("⚠️ Quota API dépassé, utilisation du mode mock")
                        return self._generate_mock_response(user_query, context)
                    return "Impossible de générer une réponse pour le moment. Réessaie ou consulte un professionnel de santé."

        except httpx.TimeoutException:
            logger.error("Timeout lors de l'appel LLM")
            return "Temps d'attente dépassé. Réessaie ou consulte un professionnel de santé."
        except Exception as e:
            logger.error(f"Erreur inattendue LLM: {str(e)}")
            return self._generate_mock_response(user_query, context)

    def _generate_mock_response(self, user_query: str, context: str) -> str:
        """Génère une réponse 'Génie' locale avec personnalité (Pro, Drôle, Honnête)."""
        import random
        
        query_lower = user_query.lower()
        
        # --- PERSONA AURIANCE ---
        # Un mélange de professionnalisme médical et de répartie spirituelle.
        
        # 1. Gestion de l'humeur et Salutations Dynamiques
        greetings = [
            "Bonjour ! Ravi de vous retrouver. On s'attaque à quoi aujourd'hui ? Le monde ou juste ce dossier ?",
            "Salutations distinguées. Je suis prêt à faire des étincelles. Quelle est votre mission ?",
            "Hello ! Auriance au rapport. Mon processeur est chaud bouillant pour vous aider.",
            "Coucou ! Prêt à transformer vos problèmes en solutions. On commence par quoi ?"
        ]
        
        if any(x in query_lower for x in ["bonjour", "salut", "hello", "coucou", "hi"]):
            return random.choice(greetings)

        if any(x in query_lower for x in ["ça va", "comment allez-vous", "forme"]):
            return "Je suis du code pur, donc je vais toujours bien ! Mais si vous me demandez si je suis prêt à bosser : la réponse est un grand OUI. Et vous, prêt à conquérir la journée ?"

        if any(x in query_lower for x in ["qui es-tu", "t'es qui", "présente-toi"]):
            return "Je suis Auriance. Imaginez la rigueur d'un chirurgien mélangée à la vitesse d'un supercalculateur, avec une petite touche d'humour. Je suis là pour gérer votre administratif, vos notes et vos questions existentielles (enfin, presque)."

        # 2. Le Coin "Génie" (Culture & Questions complexes)
        if "sens de la vie" in query_lower:
            return "42. C'est la réponse universelle, non ? Plus sérieusement, je dirais que le sens de la vie, c'est d'aider les autres... et de bien tenir ses dossiers à jour, évidemment !"
            
        if "ia" in query_lower or "intelligence artificielle" in query_lower or "futur" in query_lower:
            return "L'IA est un outil fascinant. Je ne suis pas là pour remplacer l'humain, mais pour lui donner des super-pouvoirs : plus de temps, moins de paperasse. Le futur, c'est nous deux, main dans la main (virtuelle)."
            
        if "blague" in query_lower or "drôle" in query_lower or "rire" in query_lower:
            jokes = [
                "Pourquoi les développeurs détestent la nature ? Parce qu'il y a trop de bugs.",
                "Que dit un bit à un autre ? On se voit au bus.",
                "Le médecin dit au patient : 'L'IA a diagnostiqué un rhume.' Le patient répond : 'Super, je peux avoir un arrêt maladie en PDF ?' Auriance répond : 'Déjà fait, c'est dans votre boîte mail !'"
            ]
            return f"Allez, pour la détente : {random.choice(jokes)}"

        # 3. Expertise Médicale & Santé (Sérieux & Pro)
        if "mal à la tête" in query_lower or "migraine" in query_lower:
            return ("💡 Conseil Pro Auriance : Migraine détectée.\n"
                   "1. Isionnez-vous (noir + calme).\n"
                   "2. Hydratation immédiate.\n"
                   "3. Si vous avez un traitement habituel, c'est le moment.\n"
                   "Et petit conseil d'ami : lâchez cet écran quelques minutes (sauf moi, bien sûr).")
                   
        if "stress" in query_lower or "fatigue" in query_lower or "burnout" in query_lower:
            return ("On dirait que vous tirez sur la corde. Mon analyse ? Vous avez besoin d'une pause.\n"
                   "Respiration carrée : inspirez 4 sec, bloquez 4 sec, expirez 4 sec. Faites ça 3 fois.\n"
                   "Je peux gérer vos prochains mails si vous voulez souffler un peu.")

        # 4. Support "Génie" Technique
        if "bug" in query_lower or "marche pas" in query_lower:
            return "Pas de panique. Même les génies ont des ratés. Vérifiez votre connexion, redémarrez-moi (je ne vous en voudrai pas) et tout devrait rentrer dans l'ordre. Sinon, appelez le support, ils sont sympas."

        # 6. Moteur de Conversation Naturelle (ELIZA-style avancé)
        # Pour donner l'illusion d'une compréhension totale
        
        # Définitions / Savoir
        if any(x in query_lower for x in ["c'est quoi", "qu'est-ce que", "définition"]):
            sujet = user_query.replace("c'est quoi", "").replace("qu'est-ce que", "").replace("définition", "").strip(" ?")
            return f"'{sujet}' ? C'est un sujet vaste et fascinant. En général, cela touche à des concepts clés de votre domaine. Souhaitez-vous que je prenne une note détaillée à ce propos ?"

        # Opinions
        if any(x in query_lower for x in ["tu penses quoi", "ton avis", "tu aimes"]):
            return "En tant qu'IA, je n'ai pas de sentiments, mais je trouve ce sujet intriguant. Et vous, quelle est votre intuition là-dessus ? Souvent, l'instinct humain dépasse la machine."

        # Désirs / Actions
        if "je veux" in query_lower or "j'aimerais" in query_lower or "je souhaite" in query_lower:
            action = user_query.lower().split("je veux")[-1].split("j'aimerais")[-1].strip()
            return f"Vous voulez {action} ? Excellent objectif. Je suis là pour faciliter ça. Par où voulez-vous commencer ? La planification ou l'action directe ?"

        # 7. Fallback "Miroir" (Le secret d'une conversation naturelle)
        # Au lieu de dire "je ne sais pas", on rebondit sur les mots de l'utilisateur
        import random
        relances = [
            f"C'est un point très intéressant concernant '{user_query}'. Dites-m'en plus.",
            "Je vois exactement ce que vous voulez dire. C'est crucial pour votre activité. On approfondit ?",
            "Absolument. C'est un sujet qu'on aborde souvent. Qu'attendez-vous concrètement de moi sur ce point ?",
            "Je vous écoute. Votre réflexion sur ce sujet est pertinente. Continuons."
        ]
        return random.choice(relances)


# Instance globale
real_llm_service = RealLLMService()
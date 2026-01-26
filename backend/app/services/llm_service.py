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
        """Génère une réponse mock basée sur le contexte fourni."""
        query_lower = user_query.lower()
        
        # Analyse du contexte pour extraire des infos pertinentes
        response_parts = []
        
        if context:
            # Extraire les points clés du contexte
            context_preview = context[:300] if len(context) > 300 else context
            response_parts.append(f"Selon les informations disponibles: {context_preview}")
        
        # Réponses spécifiques selon le type de question
        if "migraine" in query_lower or "maux de tête" in query_lower or "céphalée" in query_lower:
            response_parts.append(
                "\n\nPour soulager une migraine légère:\n"
                "- Repose-toi dans un endroit calme et sombre\n"
                "- Applique une compresse froide sur le front\n"
                "- Hydrate-toi régulièrement\n"
                "- Évite les écrans et lumières vives\n"
                "- Du paracétamol peut aider (consulte un médecin pour la posologie)"
            )
        elif "fièvre" in query_lower or "température" in query_lower:
            response_parts.append(
                "\n\nPour la fièvre:\n"
                "- Reste bien hydraté\n"
                "- Repose-toi\n"
                "- Utilise des compresses tièdes si besoin\n"
                "- Consulte un médecin si la fièvre persiste ou dépasse 39°C"
            )
        elif "toux" in query_lower:
            response_parts.append(
                "\n\nPour la toux:\n"
                "- Hydrate-toi avec de l'eau chaude et du miel\n"
                "- Évite les irritants (fumée, poussière)\n"
                "- Utilise un humidificateur si l'air est sec\n"
                "- Consulte si la toux persiste plus de 3 semaines"
            )
        else:
            response_parts.append(
                "\n\nConseils généraux:\n"
                "- Repose-toi suffisamment\n"
                "- Hydrate-toi régulièrement\n"
                "- Consulte un professionnel de santé pour un avis personnalisé"
            )
        
        response_parts.append(
            "\n\n⚠️ Ces informations sont fournies à titre indicatif. "
            "Pour un diagnostic et traitement appropriés, consulte toujours un professionnel de santé."
        )
        
        return "".join(response_parts)


# Instance globale
real_llm_service = RealLLMService()
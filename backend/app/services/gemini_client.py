"""Generic Google Gemini AI client for the Assistant Medical feature."""
import os
import json
import logging
from typing import Optional, List, Dict, Any

import google.generativeai as genai

logger = logging.getLogger(__name__)


class GeminiClient:
    """Wrapper around the Google Generative AI SDK."""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model_fast = "gemini-2.0-flash"
        self.model_smart = "gemini-1.5-pro"
        self._configured = False

    def _ensure_configured(self):
        if not self._configured and self.api_key:
            genai.configure(api_key=self.api_key)
            self._configured = True

    async def chat(
        self,
        system_prompt: str,
        user_message: str,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> str:
        """Send a chat request to Gemini and return the text response."""
        self._ensure_configured()
        model_name = model or self.model_fast

        try:
            model_instance = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_prompt,
                generation_config=genai.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                ),
            )
            response = model_instance.generate_content(user_message)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise

    async def chat_json(
        self,
        system_prompt: str,
        user_message: str,
        model: Optional[str] = None,
        temperature: float = 0.1,
    ) -> Dict[str, Any]:
        """Chat with Gemini expecting JSON output."""
        json_instruction = (
            system_prompt
            + "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no extra text."
        )
        result = await self.chat(
            system_prompt=json_instruction,
            user_message=user_message,
            model=model,
            temperature=temperature,
        )
        # Clean potential markdown fences
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
        return json.loads(cleaned)

    def is_configured(self) -> bool:
        return bool(self.api_key)


# Singleton instance
gemini_client = GeminiClient()

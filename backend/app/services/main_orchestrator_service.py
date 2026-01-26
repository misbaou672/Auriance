"""Orchestrateur unique : Transcription -> NLP -> RAG -> Génération."""
from __future__ import annotations
import asyncio
import logging
from typing import Optional, Dict, Any

from app.services.whisper_service import WhisperService
from app.services.nlp_service import NLPService
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)


class MainOrchestrator:
    def __init__(self):
        self.whisper = WhisperService()
        self.nlp = NLPService()

    async def transcribe(self, audio_path: str, *, language: Optional[str] = None) -> Dict[str, Any]:
        """Transcrit un fichier audio avec Whisper."""
        return await self.whisper.transcribe(audio_path, language=language)

    async def extract(self, text: str) -> Dict[str, Any]:
        """Extraction NLP des champs clés (médical)."""
        return await self.nlp.extract_fields(text, None)

    async def rag(self, question: str, top_k: int = 5) -> Dict[str, Any]:
        """Récupération Qdrant + réponse LLM."""
        return await rag_service.answer(question, top_k=top_k)

    async def process_audio_question(self, audio_path: str, *, language: Optional[str] = None, top_k: int = 5) -> Dict[str, Any]:
        """
        Pipeline complet :
        1) Transcription audio
        2) Extraction NLP (optionnel, ici pour enrichir le contexte)
        3) RAG sur la question reconnue
        """
        transcription = await self.transcribe(audio_path, language=language)
        text = transcription.get("text", "")

        extracted = await self.extract(text)
        rag_result = await self.rag(text, top_k=top_k)

        return {
            "transcription": transcription,
            "extracted_fields": extracted,
            "rag": rag_result,
        }


# Exécution CLI de démonstration
async def main():
    import argparse

    parser = argparse.ArgumentParser(description="Orchestrateur AURIANCE (audio -> RAG)")
    parser.add_argument("audio", help="Chemin du fichier audio")
    parser.add_argument("--lang", default=None, help="Code langue (ex: fr, en)")
    parser.add_argument("--top_k", type=int, default=5, help="Nombre de passages à récupérer")
    args = parser.parse_args()

    orch = MainOrchestrator()
    result = await orch.process_audio_question(args.audio, language=args.lang, top_k=args.top_k)

    print("=== TRANSCRIPTION ===")
    print(result["transcription"].get("text"))
    print("\n=== EXTRACTION ===")
    print(result["extracted_fields"])
    print("\n=== RAG ===")
    print(result["rag"].get("answer"))
    print("\n=== HITS ===")
    for h in result["rag"].get("hits", []):
        print(f"- {h}")


if __name__ == "__main__":
    asyncio.run(main())
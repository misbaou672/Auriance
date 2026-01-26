"""Test direct du service LLM pour déboguer."""
import os
import sys
import asyncio
from dotenv import load_dotenv

# Charger .env
load_dotenv()

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(__file__))

from app.services.llm_service import real_llm_service

async def test_llm():
    print("🧪 Test du service LLM...")
    print(f"📍 LLM_API_KEY existe: {bool(os.getenv('LLM_API_KEY') or os.getenv('OPENAI_API_KEY'))}")
    print(f"📍 LLM_BASE_URL: {os.getenv('LLM_BASE_URL', 'https://api.openai.com/v1')}")
    print(f"📍 LLM_MODEL: {os.getenv('LLM_MODEL', 'gpt-3.5-turbo')}")
    print()
    
    question = "Comment soulager une migraine ?"
    context = "La migraine associe cephalees pulsatiles, photophobie, nausees."
    
    print(f"❓ Question: {question}")
    print(f"📚 Contexte: {context}")
    print()
    
    answer = await real_llm_service.generate_health_response(question, context)
    
    print(f"✅ Réponse: {answer}")

if __name__ == "__main__":
    asyncio.run(test_llm())

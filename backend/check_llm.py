
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from app.services.llm_service import real_llm_service
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    key = real_llm_service.api_key
    print(f"API KEY PRESENT: {bool(key)}")
    print(f"MOCK MODE: {real_llm_service.mock_mode}")
    print(f"ENV LLM_API_KEY: {bool(os.getenv('LLM_API_KEY'))}")
    print(f"ENV OPENAI_API_KEY: {bool(os.getenv('OPENAI_API_KEY'))}")

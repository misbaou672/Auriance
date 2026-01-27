
import asyncio
import os
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.services.tts_service import tts_service

async def test_tts():
    print("Testing TTS Service...")
    text = "Bonjour, ceci est un test de synthèse vocale."
    try:
        url = await tts_service.generate_speech(text)
        if url:
            print(f"SUCCESS: {url}")
        else:
            print("FAILURE: URL is None")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    asyncio.run(test_tts())

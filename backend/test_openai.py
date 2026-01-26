
import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

async def test_openai():
    api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    
    print(f"Testing with Key: {api_key[:5]}...*****")
    print(f"Base URL: {base_url}")
    print(f"Model: {model}")
    
    if not api_key:
        print("ERROR: No API Key found.")
        return

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": "Hello, are you working?"}],
                    "max_tokens": 10
                },
                timeout=10
            )
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print("Response:", resp.json())
            else:
                print("Error Body:", resp.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_openai())

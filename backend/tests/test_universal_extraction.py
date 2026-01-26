import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_universal():
    print(f"Testing UNIVERSAL extraction on {BASE_URL}...")
    
    test_cases = [
        "Patient Zorglub Bizarre, 99 ans. Symptomes: gloubi boulga vert. Diagnostic: schtroumpfite aigüe. Traitement: potion magique.",
        "Je m'appelle Goku Son. J'ai 35 ans. J'ai mal aux cheveux. Diagnostic: fatigue super guerrier. Prends des senzu.",
        "Le patient s'appelle Elon Musk. Il a de la fievre martienne. Diagnostic: infection spatiale. Traitement: repos sur Mars."
    ]
    
    for i, text in enumerate(test_cases):
        print(f"\n--- CASE {i+1} ---")
        print(f"Input: {text}")
        try:
            response = requests.post(f"{BASE_URL}/api/auriance/form-json", data={
                "transcription": text,
                "form_type": "medical"
            })
            
            if response.status_code == 200:
                data = response.json()
                print("Result:")
                print(json.dumps(data.get("form_json", {}), indent=2, ensure_ascii=False))
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    test_universal()

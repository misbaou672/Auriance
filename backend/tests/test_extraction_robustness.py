import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_extraction():
    print(f"Testing extraction on {BASE_URL}...")
    
    test_cases = [
        "Patient Jean Dupont, 45 ans, présente une toux sèche et de la fièvre forte. Diagnostic probable grippe A. Traitement : repos, paracétamol et hydratation.",
        "Bonjour, ici le docteur House. Patient Gregory House, 50 ans. Il a mal à la tête et des vertiges. Diagnostic migraine ophtalmique. Prescrire ibuprofène.",
        "Je m'appelle Thomas Anderson, j'ai 30 ans. J'ai mal au ventre. Je pense que c'est une gastro. Il faut prendre du smecta."
    ]
    
    for i, text in enumerate(test_cases):
        print(f"\n--- CASE {i+1} ---")
        print(f"Input: {text}")
        try:
            # On appelle l'endpoint utilisé par le mobile: form-json
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
    test_extraction()

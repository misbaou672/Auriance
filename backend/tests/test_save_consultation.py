import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_save_consultation():
    print(f"Testing save-consultation on {BASE_URL}...")
    
    payload = {
        "transcription": "Patient Test, 30 ans, fièvre, grippe, repos.",
        "nom": "Dupont",
        "prenom": "Jean",
        "age": 30,
        "genre": "Homme",
        "symptomes": "Fièvre",
        "diagnostic": "Grippe",
        "traitement": "Repos",
        "medecin_id": 1
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auriance/save-consultation", data=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "consultation_id" in data:
                print("✅ TEST PASSED: Consultation saved!")
            else:
                print("❌ TEST FAILED: Success flag missing or ID missing.")
        else:
            print("❌ TEST FAILED: HTTP Error.")
            
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {e}")

if __name__ == "__main__":
    test_save_consultation()

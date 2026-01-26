
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_extraction_fix():
    test_cases = [
        "Patient Martin Dupont, 45 ans, fièvre à 38.5",
        "Madame Sophie, 32 ans, toux et fatigue",
        "M. Bernard, 60 ans, douleur thoracique et essoufflement",
        "Patient Jean, 28 ans, nausées et vomissements, diagnostic gastro",
        "Marie Curie, 55 ans, maux de tête, prescrire paracétamol 500mg"
    ]

    print(f"Running extraction tests on {BASE_URL}...")
    
    for case in test_cases:
        try:
            # Note: The endpoint expected by the route we modified is /api/auriance/form-json
            response = requests.post(
                f"{BASE_URL}/api/auriance/form-json",
                data={"transcription": case}
            )
            data = response.json()
            print(f"\n📝 INPUT: {case}")
            if response.status_code == 200 and data.get("success"):
                print("✅ RESULT:", json.dumps(data.get("form_json"), indent=2, ensure_ascii=False))
            else:
                print(f"❌ ERROR {response.status_code}: {response.text}")

        except Exception as e:
            print(f"❌ REQUEST FAILED: {e}")

if __name__ == "__main__":
    test_extraction_fix()

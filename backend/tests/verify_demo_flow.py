import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_demo_extraction():
    print("\n--- 1. Testing Demo Extraction Logic (NLP) ---")
    # Simuler ce que le backend recevrait après transcription Whisper
    # On teste ici la logique d'extraction directe via le service ou un endpoint de test
    # Comme on ne peut pas facilement envoyer de l'audio ici sans fichier, on va tester l'endpoint 'generate-form-json' 
    # qui est appelé par 'transcribe-and-extract' ou on teste l'endpoint de debug si dispo.
    # Mais le plus simple est d'utiliser /api/auriance/form-json avec le texte transcrit.
    
    demo_phrase = "Patient Jean Dupont, 45 ans, fièvre et toux, diagnostic grippe, prescrire paracétamol"
    
    payload = {
        "transcription": demo_phrase,
        "form_type": "medical"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auriance/form-json", data=payload)
        response.raise_for_status()
        data = response.json()
        
        print(f"Input: {demo_phrase}")
        if "form_json" in data:
            form = data["form_json"]
            print("Extracted Data:", json.dumps(form, indent=2, ensure_ascii=False))
            
            # Validation
            if (form.get("nom") == "Dupont" and 
                form.get("prenom") == "Jean" and 
                str(form.get("age")) == "45" and 
                "grippe" in form.get("diagnostic", "").lower()):
                print("✅ Extraction SUCCESS")
            else:
                print("❌ Extraction MISMATCH")
        else:
            print("❌ Unexpected response format:", data)
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_query_generation():
    print("\n--- 2. Testing Query Generation ---")
    intent = "Patients qui ont de la fièvre"
    
    # SQL
    try:
        resp_sql = requests.post(f"{BASE_URL}/api/auriance/generate-sql-query", data={"intent": intent})
        print(f"SQL Response ({resp_sql.status_code}): {resp_sql.text[:100]}...")
        if resp_sql.status_code == 200 and "SELECT" in resp_sql.json().get("sql", "").upper():
            print("✅ SQL Generation SUCCESS")
        else:
            print("❌ SQL Generation FAILED")
    except Exception as e:
        print(f"❌ SQL Error: {e}")

    # Cypher
    try:
        resp_cypher = requests.post(f"{BASE_URL}/api/auriance/generate-cypher-query", data={"intent": intent})
        print(f"Cypher Response ({resp_cypher.status_code}): {resp_cypher.text[:100]}...")
        if resp_cypher.status_code == 200 and "MATCH" in resp_cypher.json().get("cypher", "").upper():
            print("✅ Cypher Generation SUCCESS")
        else:
            print("❌ Cypher Generation FAILED")
    except Exception as e:
        print(f"❌ Cypher Error: {e}")

    # Vector Search
    try:
        resp_vec = requests.get(f"{BASE_URL}/api/demo/search", params={"query": intent, "limit": 2})
        print(f"Vector Response ({resp_vec.status_code}): {str(resp_vec.json())[:100]}...")
        if resp_vec.status_code == 200:
            print("✅ Vector Search SUCCESS")
        else:
            print("❌ Vector Search FAILED")
    except Exception as e:
        print(f"❌ Vector Error: {e}")

if __name__ == "__main__":
    test_demo_extraction()
    test_query_generation()

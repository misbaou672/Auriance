#!/usr/bin/env python3
"""Test l'API /form-json avec le texte qui causait le problème."""
import requests
import json

API_BASE_URL = "http://192.168.1.30:8001"

test_cases = [
    {
        "name": "Cas avec parasites vocaux",
        "transcription": "Luc Moreau 60 ans homme passion fièvre forte fièvre à 40 diagnostic probable bronchite action passion jean jacques âge 50 ans genre femme phantom fièvre musique grippe et traitement prescrit paracétamol et amoxicilline",
        "check_symptomes": "fièvre",
        "check_NOT_in_symptomes": "passion",  # Ne doit PAS contenir les parasites
    },
    {
        "name": "Cas normal",
        "transcription": "Patient Sophie Dubois 28 ans femme migraine forte nausée et vomissement diagnostic probable migraine traitement ibuprofène et paracétamol",
        "check_symptomes": "migraine",
        "check_NOT_in_traitement": "ibuprofène et paracétamol",  # Pas tout le texte, juste les noms
    },
]

def test_api():
    print("=" * 70)
    print("🧪 TEST API /form-json")
    print("=" * 70)
    
    for i, test in enumerate(test_cases, 1):
        print(f"\nTEST {i}: {test['name']}")
        print("-" * 70)
        
        payload = {
            "transcription": test["transcription"],
            "form_type": "medical"
        }
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/api/auriance/form-json",
                data=payload,
                timeout=5
            )
            
            if response.status_code != 200:
                print(f"❌ Erreur HTTP {response.status_code}")
                print(response.text)
                continue
            
            data = response.json()
            form_json = data.get("form_json", {})
            
            print(f"✅ API Réponse reçue")
            print(f"\n📋 Données extraites:")
            print(f"  Prénom: {form_json.get('prenom', 'N/A')}")
            print(f"  Nom: {form_json.get('nom', 'N/A')}")
            print(f"  Âge: {form_json.get('age', 'N/A')}")
            print(f"  Genre: {form_json.get('genre', 'N/A')}")
            print(f"  Symptômes: {form_json.get('symptomes', 'N/A')}")
            print(f"  Diagnostic: {form_json.get('diagnostic', 'N/A')}")
            print(f"  Traitement: {form_json.get('traitement', 'N/A')}")
            
            # Vérifications
            checks_ok = True
            
            if "check_symptomes" in test:
                if test["check_symptomes"] not in form_json.get("symptomes", "").lower():
                    print(f"  ⚠️ Symptôme '{test['check_symptomes']}' non trouvé")
                    checks_ok = False
                else:
                    print(f"  ✓ Symptôme '{test['check_symptomes']}' trouvé")
            
            if "check_NOT_in_symptomes" in test:
                if test["check_NOT_in_symptomes"].lower() in form_json.get("symptomes", "").lower():
                    print(f"  ⚠️ Parasite '{test['check_NOT_in_symptomes']}' trouvé dans symptômes (NE DOIT PAS Y ÊTRE)")
                    checks_ok = False
                else:
                    print(f"  ✓ Parasite '{test['check_NOT_in_symptomes']}' bien absent")
            
            if "check_traitement" in test:
                if test["check_traitement"] not in form_json.get("traitement", "").lower():
                    print(f"  ⚠️ Traitement '{test['check_traitement']}' non trouvé")
                    checks_ok = False
            
            if checks_ok:
                print(f"\n✅ TEST RÉUSSI")
            else:
                print(f"\n⚠️ TEST PARTIEL")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Impossible de se connecter à {API_BASE_URL}")
            print("   Assurez-vous que le serveur est lancé:")
            print(f"   python -m uvicorn app.main_simple:app --host 192.168.1.30 --port 8001")
        except Exception as e:
            print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_api()
    print("\n" + "=" * 70)
    print("✨ Tests API complétés!")

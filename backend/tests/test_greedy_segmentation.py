import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_greedy_segmentation():
    print(f"Testing GREEDY SEGMENTATION on {BASE_URL}...")
    
    test_cases = [
        {
            "name": "Complete structured input",
            "text": "Patient Jean Dupont, 45 ans. Symptômes: toux sèche et fièvre forte depuis 3 jours. Diagnostic: probable grippe saisonnière. Traitement: repos complet, doliprane 1000mg et beaucoup d'eau."
        },
        {
            "name": "Non-medical terms",
            "text": "Patient Yoda, 900 ans. Symptômes: perturbation dans la force et fatigue mentale. Diagnostic: manque de sommeil et stress jedi. Traitement: méditation profonde et repos sur Dagobah."
        },
        {
            "name": "Mixed order with extra words",
            "text": "Bonjour, le patient s'appelle Marie Curie. Elle a 30 ans. Les symptômes sont: mal de tête intense, nausées et vertiges. Le diagnostic c'est une migraine ophtalmique. Pour le traitement je prescris ibuprofène et repos dans le noir."
        },
        {
            "name": "Minimal punctuation",
            "text": "Patient Thomas 40 ans symptomes fievre toux diagnostic grippe traitement paracetamol repos"
        },
        {
            "name": "Long complex symptoms",
            "text": "Patient Sophie Bernard 28 ans. Symptômes: douleur abdominale aiguë localisée dans le quadrant inférieur droit accompagnée de nausées vomissements et fièvre modérée à 38.5 degrés. Diagnostic: suspicion d'appendicite aiguë nécessitant une évaluation chirurgicale urgente. Traitement: hospitalisation immédiate antalgiques par voie intraveineuse et consultation chirurgicale en urgence."
        }
    ]
    
    for i, case in enumerate(test_cases):
        print(f"\n{'='*80}")
        print(f"TEST CASE {i+1}: {case['name']}")
        print(f"{'='*80}")
        print(f"Input: {case['text']}")
        print()
        
        try:
            response = requests.post(f"{BASE_URL}/api/auriance/form-json", data={
                "transcription": case['text'],
                "form_type": "medical"
            })
            
            if response.status_code == 200:
                data = response.json()
                form_json = data.get("form_json", {})
                
                print("✅ EXTRACTION SUCCESSFUL")
                print(f"Nom: {form_json.get('nom', 'N/A')}")
                print(f"Prénom: {form_json.get('prenom', 'N/A')}")
                print(f"Age: {form_json.get('age', 'N/A')}")
                print(f"Symptômes: {form_json.get('symptomes', 'N/A')}")
                print(f"Diagnostic: {form_json.get('diagnostic', 'N/A')}")
                print(f"Traitement: {form_json.get('traitement', 'N/A')}")
                print(f"Température: {form_json.get('temperature', 'N/A')}")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    print(f"\n{'='*80}")
    print("TESTING COMPLETE")
    print(f"{'='*80}")

if __name__ == "__main__":
    test_greedy_segmentation()

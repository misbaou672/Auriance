#!/usr/bin/env python3
"""Test que les symptômes et traitements ne capturent PAS tout le texte."""
import asyncio
import sys
sys.path.insert(0, 'c:\\Users\\marec\\Documents\\auriance\\backend')

from app.services.nlp_service import NLPService

async def test_symptom_extraction():
    """Tester l'extraction propre des symptômes (PAS tout le texte)."""
    service = NLPService()
    
    test_cases = [
        {
            "input": "Luc Moreau 60 ans homme passion fièvre forte fièvre à 40 diagnostic probable bronchite action passion jean jacques âge 50 ans genre femme phantom fièvre musique grippe et traitement prescrit paracétamol et amoxicilline",
            "expected_symptomes": "fièvre",  # SEULEMENT "fièvre" et "fièvre à 40", pas le reste
            "expected_diagnostic": "bronchite",
            "expected_traitement": "paracétamol, amoxicilline",  # SEULEMENT les noms de médocs
        },
        {
            "input": "Patient Sophie Dubois 28 ans femme euh migraine forte nausée et vomissement diagnostic probable migraine traitement prescrit ibuprofène et paracétamol",
            "expected_symptomes": "migraine, nausée, vomissement",
            "expected_diagnostic": "migraine",
            "expected_traitement": "ibuprofène, paracétamol",
        },
        {
            "input": "Ahmed 55 ans homme diabète hypertension metformine et amlodipine",
            "expected_symptomes": "",  # Pas de symptômes, juste des maladies
            "expected_diagnostic": "diabète",  # Diagnostic remplit
            "expected_traitement": "metformine, amlodipine",
        },
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'='*70}")
        print(f"TEST {i}: {test['input'][:50]}...")
        print('='*70)
        
        result = await service.extract_medical_form_fields(test["input"])
        
        print(f"Symptômes extraits: {result.get('symptomes', 'N/A')}")
        print(f"  → Attendu: {test['expected_symptomes']}")
        
        print(f"Diagnostic: {result.get('diagnostic', 'N/A')}")
        print(f"  → Attendu: {test['expected_diagnostic']}")
        
        print(f"Traitement: {result.get('traitement', 'N/A')}")
        print(f"  → Attendu: {test['expected_traitement']}")
        
        # Vérifications
        symptomes_ok = test['expected_symptomes'] == '' or (
            all(word in result.get('symptomes', '').lower() for word in test['expected_symptomes'].split(', ') if word)
        )
        
        traitement_ok = all(
            word in result.get('traitement', '').lower() for word in test['expected_traitement'].split(', ') if word
        )
        
        diagnostic_ok = test['expected_diagnostic'].lower() in result.get('diagnostic', '').lower()
        
        if symptomes_ok and traitement_ok and diagnostic_ok:
            print("\n✅ TEST RÉUSSI")
        else:
            print(f"\n⚠️ TEST PARTIEL")
            if not symptomes_ok:
                print(f"   - Symptômes: attendu '{test['expected_symptomes']}', reçu '{result.get('symptomes', '')}'")
            if not diagnostic_ok:
                print(f"   - Diagnostic: attendu '{test['expected_diagnostic']}', reçu '{result.get('diagnostic', '')}'")
            if not traitement_ok:
                print(f"   - Traitement: attendu '{test['expected_traitement']}', reçu '{result.get('traitement', '')}'")

if __name__ == "__main__":
    asyncio.run(test_symptom_extraction())
    print("\n" + "="*70)
    print("✨ Tests de nettoyage symptômes/traitements complétés!")

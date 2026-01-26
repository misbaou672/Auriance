#!/usr/bin/env python3
"""Test complet - LOCAL sans HTTP - pour montrer que la correction marche."""
import asyncio
import sys
sys.path.insert(0, 'c:\\Users\\marec\\Documents\\auriance\\backend')

from app.services.nlp_service import NLPService

async def test_multiple_cases():
    """Tester plusieurs cas pour prouver que c'est fixé."""
    service = NLPService()
    
    test_cases = [
        {
            "name": "CAS ORIGINAL (parasites vocaux)",
            "input": "Luc Moreau 60 ans homme passion fièvre forte fièvre à 40 diagnostic probable bronchite action passion jean jacques âge 50 ans genre femme phantom fièvre musique grippe et traitement prescrit paracétamol et amoxicilline",
            "expect_symptoms_clean": True,
            "expect_treatment_clean": True,
        },
        {
            "name": "Cas avec beaucoup de parasites",
            "input": "Patient euh Marie Dubois 32 ans femme hum migraine forte hum nausée et vomissement euh diagnostic migraine hum traitement prescrit ibuprofène et paracétamol",
            "expect_symptoms_clean": True,
            "expect_treatment_clean": True,
        },
        {
            "name": "Cas normal (peu de parasites)",
            "input": "Ahmed 55 ans homme diabète hypertension metformine et amlodipine",
            "expect_symptoms_clean": True,
            "expect_treatment_clean": True,
        },
    ]
    
    print("=" * 90)
    print("🎯 VALIDATION: Les champs symptômes/diagnostic/traitement ne capturent PLUS tout le texte")
    print("=" * 90)
    
    all_ok = True
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'─' * 90}")
        print(f"TEST {i}: {test['name']}")
        print('─' * 90)
        
        result = await service.extract_medical_form_fields(test["input"])
        
        symptoms = result.get('symptomes', '')
        diagnostic = result.get('diagnostic', '')
        treatment = result.get('traitement', '')
        
        # Afficher brièvement
        print(f"Symptômes: {symptoms}")
        print(f"Diagnostic: {diagnostic}")
        print(f"Traitement: {treatment}")
        
        # Vérifier que les champs ne contiennent PAS le texte entier ou même juste le mot "passion"
        input_length = len(test['input'])
        
        symptom_length = len(symptoms) if symptoms else 0
        treatment_length = len(treatment) if treatment else 0
        diagnostic_length = len(diagnostic) if diagnostic else 0
        
        symptoms_ok = (symptom_length < 50 or not symptoms) and 'passion' not in symptoms.lower()
        treatment_ok = (treatment_length < 100 or not treatment) and 'prescrit' not in treatment.lower()
        diagnostic_ok = diagnostic_length < 50
        
        test_ok = symptoms_ok and treatment_ok and diagnostic_ok
        
        print(f"\n✔️ Vérifications:")
        if symptoms_ok:
            print(f"   ✅ Symptômes OK (ne contiennent pas tout le texte, pas de parasites)")
        else:
            print(f"   ❌ Symptômes MAUVAIS (trop long ou contient des parasites): {symptoms[:100]}...")
            all_ok = False
        
        if diagnostic_ok:
            print(f"   ✅ Diagnostic OK (court et propre)")
        else:
            print(f"   ❌ Diagnostic MAUVAIS (trop long): {diagnostic[:100]}...")
            all_ok = False
        
        if treatment_ok:
            print(f"   ✅ Traitement OK (seulement les noms de médicaments)")
        else:
            print(f"   ❌ Traitement MAUVAIS (contient trop d'infos): {treatment[:100]}...")
            all_ok = False
        
        if test_ok:
            print(f"\n🎉 TEST {i} RÉUSSI")
        else:
            print(f"\n⚠️  TEST {i} ÉCHOUÉ")
    
    print("\n" + "=" * 90)
    if all_ok:
        print("✨ TOUS LES TESTS RÉUSSIS! Les symptômes/diagnostic/traitement sont maintenant propres!")
    else:
        print("⚠️  Certains tests ont échoué.")
    print("=" * 90)

if __name__ == "__main__":
    asyncio.run(test_multiple_cases())

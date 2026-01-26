"""Test du remplissage automatique de formulaire médical"""
import asyncio
import sys
sys.path.insert(0, '.')

from app.services.nlp_service import NLPService

async def test_medical_form():
    """Teste l'extraction de champs médicaux"""
    
    nlp = NLPService()
    
    # Test 1: Consultation complète
    print("\n" + "="*60)
    print("TEST 1: Consultation complète")
    print("="*60)
    
    text1 = "Patient Martin Dupont, 45 ans, homme, fièvre à 38, toux sèche, probable grippe, prescrire paracétamol"
    result1 = await nlp.extract_medical_form_fields(text1)
    
    print(f"\n📝 Texte: {text1}")
    print(f"\n✅ Résultat:")
    for key, value in result1.items():
        print(f"  • {key}: {value}")
    
    # Test 2: Cas simple
    print("\n" + "="*60)
    print("TEST 2: Cas simple")
    print("="*60)
    
    text2 = "Le patient s'appelle Marie Lambert, 32 ans, femme, mal de tête et nausée"
    result2 = await nlp.extract_medical_form_fields(text2)
    
    print(f"\n📝 Texte: {text2}")
    print(f"\n✅ Résultat:")
    for key, value in result2.items():
        print(f"  • {key}: {value}")
    
    # Test 3: Avec prescription
    print("\n" + "="*60)
    print("TEST 3: Avec prescription détaillée")
    print("="*60)
    
    text3 = "Monsieur Jean Moreau, 60 ans, douleur thoracique, suspicion de angine, traitement antibiotique amoxicilline"
    result3 = await nlp.extract_medical_form_fields(text3)
    
    print(f"\n📝 Texte: {text3}")
    print(f"\n✅ Résultat:")
    for key, value in result3.items():
        print(f"  • {key}: {value}")
    
    print("\n" + "="*60)
    print("✅ TESTS TERMINÉS")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_medical_form())

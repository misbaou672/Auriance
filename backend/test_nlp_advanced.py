"""Test du NLP amélioré avec tous types de symptômes et maladies"""
import asyncio
import sys
sys.path.insert(0, '.')

from app.services.nlp_service import NLPService

async def test_advanced_nlp():
    """Teste la reconnaissance avancée"""
    
    nlp = NLPService()
    
    # Test 1: Symptômes variés
    print("\n" + "="*60)
    print("TEST 1: Symptômes variés")
    print("="*60)
    
    text1 = "Patient Sophie Lefebvre 28 ans femme migraine sévère nausée vomissement vertige depuis 3 jours"
    result1 = await nlp.extract_medical_form_fields(text1)
    
    print(f"\n📝 Texte: {text1}")
    print(f"\n✅ Résultat:")
    for key, value in result1.items():
        print(f"  • {key}: {value}")
    
    # Test 2: Maladie chronique
    print("\n" + "="*60)
    print("TEST 2: Maladie chronique avec traitement")
    print("="*60)
    
    text2 = "Monsieur Ahmed Benali 55 ans homme diabète type 2 hypertension prescrire metformine et amlodipine"
    result2 = await nlp.extract_medical_form_fields(text2)
    
    print(f"\n📝 Texte: {text2}")
    print(f"\n✅ Résultat:")
    for key, value in result2.items():
        print(f"  • {key}: {value}")
    
    # Test 3: Infection respiratoire
    print("\n" + "="*60)
    print("TEST 3: Infection respiratoire")
    print("="*60)
    
    text3 = "Patiente Claire Dubois 42 ans bronchite aigue toux grasse fievre 39 essoufflement traitement amoxicilline et ibuprofene"
    result3 = await nlp.extract_medical_form_fields(text3)
    
    print(f"\n📝 Texte: {text3}")
    print(f"\n✅ Résultat:")
    for key, value in result3.items():
        print(f"  • {key}: {value}")
    
    # Test 4: Noms composés et accents
    print("\n" + "="*60)
    print("TEST 4: Noms composés")
    print("="*60)
    
    text4 = "Patient Jean-Pierre De La Fontaine 65 ans homme arthrose lombaire sciatique douleur chronique prescrire tramadol"
    result4 = await nlp.extract_medical_form_fields(text4)
    
    print(f"\n📝 Texte: {text4}")
    print(f"\n✅ Résultat:")
    for key, value in result4.items():
        print(f"  • {key}: {value}")
    
    print("\n" + "="*60)
    print("✅ TESTS TERMINÉS")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_advanced_nlp())

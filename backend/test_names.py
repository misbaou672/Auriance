#!/usr/bin/env python3
"""Test l'extraction du nom/prénom corrigée."""
import asyncio
import sys
sys.path.insert(0, 'c:\\Users\\marec\\Documents\\auriance\\backend')

from app.services.nlp_service import NLPService

async def test_names():
    """Tester l'extraction des noms/prénoms."""
    service = NLPService()
    
    test_cases = [
        "Patient Luc Moreau 60 ans homme fièvre bronchite paracétamol",
        "Jean-Martin âge 50 ans femme fièvre grippe paracétamol",
        "passionnant Jean prénom Michael âge 50 ans femme fièvre grippe paracétamol",
        "Sophie Dubois 28 ans femme migraine ibuprofène",
        "Je m'appelle Ahmed Benali 55 ans diabète metformine",
        "Monsieur Martin Dupont 45 ans grippe",
        "Madame Claire Moreau 42 ans bronchite amoxicilline",
    ]
    
    print("=" * 80)
    print("🧪 TEST: Extraction Nom/Prénom (CORRIGÉE)")
    print("=" * 80)
    
    for i, test in enumerate(test_cases, 1):
        result = await service.extract_medical_form_fields(test)
        
        prenom = result.get('prenom', '❌ NON TROUVÉ')
        nom = result.get('nom', '❌ NON TROUVÉ')
        
        status = "✅" if (result.get('prenom') and result.get('nom')) else "⚠️"
        
        print(f"\n{status} Test {i}:")
        print(f"   Input: {test}")
        print(f"   Prénom: {prenom}")
        print(f"   Nom: {nom}")

if __name__ == "__main__":
    asyncio.run(test_names())
    print("\n" + "=" * 80)

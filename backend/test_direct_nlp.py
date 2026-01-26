#!/usr/bin/env python3
"""Test DIRECT la fonction extract_medical_form_fields sans HTTP."""
import asyncio
import sys
sys.path.insert(0, 'c:\\Users\\marec\\Documents\\auriance\\backend')

from app.services.nlp_service import NLPService

async def test_direct():
    """Tester directement la fonction NLP sans serveur HTTP."""
    service = NLPService()
    
    print("=" * 80)
    print("🧪 TEST DIRECT: extract_medical_form_fields()")
    print("=" * 80)
    
    # Le cas problématique original
    transcription = (
        "Luc Moreau 60 ans homme passion fièvre forte fièvre à 40 "
        "diagnostic probable bronchite action passion jean jacques âge 50 ans "
        "genre femme phantom fièvre musique grippe et traitement prescrit "
        "paracétamol et amoxicilline"
    )
    
    print(f"\n📝 Transcription (avec parasites):")
    print(f"  {transcription}\n")
    
    result = await service.extract_medical_form_fields(transcription)
    
    print(f"✅ Résultats extraits:")
    print(f"  Prénom: {result.get('prenom', 'N/A')}")
    print(f"  Nom: {result.get('nom', 'N/A')}")
    print(f"  Âge: {result.get('age', 'N/A')}")
    print(f"  Genre: {result.get('genre', 'N/A')}")
    print(f"  Symptômes: {result.get('symptomes', 'N/A')}")
    print(f"  Diagnostic: {result.get('diagnostic', 'N/A')}")
    print(f"  Traitement: {result.get('traitement', 'N/A')}")
    
    print(f"\n📊 VÉRIFICATIONS:")
    
    # Check symptômes
    symptoms = result.get('symptomes', '')
    if 'fièvre' in symptoms.lower() and 'passion' not in symptoms.lower():
        print(f"  ✅ Symptômes OK: ne contient que 'fièvre', pas de parasites")
    else:
        print(f"  ❌ Symptômes MAUVAIS: '{symptoms}'")
        if 'passion' in symptoms.lower():
            print(f"     → Contient 'passion' (MAUVAIS!)")
    
    # Check traitement
    treatment = result.get('traitement', '')
    if 'paracétamol' in treatment.lower() and 'amoxicilline' in treatment.lower():
        print(f"  ✅ Traitement OK: ne contient que les noms de médicaments")
    else:
        print(f"  ❌ Traitement MAUVAIS: '{treatment}'")
    
    # Check diagnostic
    diagnostic = result.get('diagnostic', '')
    if diagnostic.lower() == 'bronchite' and len(diagnostic) <= 20:
        print(f"  ✅ Diagnostic OK: 'bronchite', pas tout le texte")
    else:
        print(f"  ❌ Diagnostic MAUVAIS: '{diagnostic[:50]}...'")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    asyncio.run(test_direct())

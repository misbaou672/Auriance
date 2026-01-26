"""
Test simple pour vérifier la génération de requêtes SQL, Cypher et Vectorielle
"""
import sys
import os

# Ajouter le répertoire parent au path pour pouvoir importer app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from app.services.query_generation_service import QueryGenerationService

async def test_query_generation():
    """Test la génération de requêtes depuis une phrase"""
    service = QueryGenerationService()
    
    # Phrases de test
    test_cases = [
        "Montre-moi les patients avec de la fièvre",
        "Afficher tous les projets sur la biodiversité",
        "Chercher les observations d'espèces rares",
        "Patients ayant consulté pour des maux de tête"
    ]
    
    print("=" * 60)
    print("TEST DE GÉNÉRATION DE REQUÊTES")
    print("=" * 60)
    
    for i, intent in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"TEST {i}: \"{intent}\"")
        print(f"{'='*60}")
        
        # Test SQL
        print("\n📊 GÉNÉRATION SQL:")
        sql_result = await service.generate_sql(intent, {})
        if isinstance(sql_result, dict):
            print(f"  Table: {sql_result.get('table')}")
            print(f"  Action: {sql_result.get('action')}")
            print(f"  Requête: {sql_result.get('query')}")
            if sql_result.get('error'):
                print(f"  ❌ Erreur: {sql_result.get('error')}")
        else:
            print(f"  Résultat: {sql_result}")
        
        # Test Cypher
        print("\n🔗 GÉNÉRATION CYPHER:")
        cypher_result = await service.generate_cypher(intent, {})
        if isinstance(cypher_result, dict):
            print(f"  Type de nœud: {cypher_result.get('node_type')}")
            print(f"  Relation: {cypher_result.get('relation')}")
            print(f"  Requête: {cypher_result.get('query')}")
            if cypher_result.get('error'):
                print(f"  ❌ Erreur: {cypher_result.get('error')}")
        else:
            print(f"  Résultat: {cypher_result}")
        
        # Test Vectoriel (simulation)
        print("\n🔍 REQUÊTE VECTORIELLE:")
        print(f"  Query: \"{intent}\"")
        print(f"  Collection: documents")
        print(f"  Limit: 5")
    
    print(f"\n{'='*60}")
    print("✅ TESTS TERMINÉS")
    print(f"{'='*60}")

if __name__ == "__main__":
    asyncio.run(test_query_generation())

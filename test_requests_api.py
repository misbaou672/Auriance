#!/usr/bin/env python3
"""Test des endpoints de requête générée"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_generate_sql_query():
    """Tester la génération de requête SQL"""
    print("\n✅ TEST: Génération de requête SQL")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auriance/generate-sql-query",
            data={
                "intent": "Montre-moi les patients avec de la fièvre",
                "context": json.dumps({"medical_context": True})
            }
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"SQL Query: {data.get('sql', 'N/A')}")
            return True
        else:
            print(f"Erreur: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_generate_cypher_query():
    """Tester la génération de requête Cypher"""
    print("\n✅ TEST: Génération de requête Cypher")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auriance/generate-cypher-query",
            data={
                "intent": "Patients avec diagnostic pneumonie",
                "context": json.dumps({"graph_context": True})
            }
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Cypher Query: {data.get('cypher', 'N/A')}")
            return True
        else:
            print(f"Erreur: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_health():
    """Tester l'endpoint health"""
    print("\n✅ TEST: Health check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Tests des endpoints AURIANCE")
    print(f"Base URL: {BASE_URL}\n")
    
    # Test health
    if test_health():
        # Test génération requêtes
        test_generate_sql_query()
        test_generate_cypher_query()
    else:
        print("❌ Serveur non accessible!")

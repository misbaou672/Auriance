"""Test simple pour vérifier si les endpoints de génération de requêtes fonctionnent"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    print("=" * 60)
    print("TEST DES ENDPOINTS DE GÉNÉRATION DE REQUÊTES")
    print("=" * 60)
    
    # Phrase de test
    intent = "Montre-moi les patients avec de la fièvre"
    
    print(f"\n🎯 Intention testée : \"{intent}\"")
    print("=" * 60)
    
    # Test 1: Génération SQL
    print("\n📊 TEST 1: Génération SQL")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auriance/generate-sql-query",
            data={"intent": intent},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            sql = data.get('sql', '')
            print(f"✅ Statut: {response.status_code}")
            print(f"📝 SQL généré:")
            print(f"   {sql}")
            print(f"🔍 Détails: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    # Test 2: Génération Cypher
    print("\n🔗 TEST 2: Génération Cypher")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auriance/generate-cypher-query",
            data={"intent": intent},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            cypher = data.get('cypher', '')
            print(f"✅ Statut: {response.status_code}")
            print(f"📝 Cypher généré:")
            print(f"   {cypher}")
            print(f"🔍 Détails: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    # Test 3: Recherche vectorielle (demo search)
    print("\n🔍 TEST 3: Recherche Vectorielle")
    try:
        response = requests.post(
            f"{BASE_URL}/api/demo/search",
            data={"query": intent, "limit": 5},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            print(f"✅ Statut: {response.status_code}")
            print(f"📝 Résultats trouvés: {len(results)}")
            if results:
                print(f"🔍 Premier résultat: {results[0]}")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    print("\n" + "=" * 60)
    print("✅ TESTS TERMINÉS")
    print("=" * 60)

if __name__ == "__main__":
    import time
    print("⏳ Attente que le serveur soit prêt...")
    time.sleep(3)
    test_endpoints()

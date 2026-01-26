"""Test rapide de connexion après correction CORS"""
import requests

API_URL = "http://localhost:8000"

print("🧪 TEST DE CONNEXION")
print("=" * 60)

# Test 1: Health check
try:
    response = requests.get(f"{API_URL}/health")
    if response.status_code == 200:
        print("✅ Backend accessible")
    else:
        print(f"❌ Backend erreur: {response.status_code}")
except Exception as e:
    print(f"❌ Backend non accessible: {e}")
    exit(1)

# Test 2: Login avec un utilisateur existant
print("\n🔐 Test de connexion...")
try:
    response = requests.post(
        f"{API_URL}/auth/login",
        data={
            "username": "test_user_1737300444",  # Utilisateur créé précédemment
            "password": "TestPassword123!"
        }
    )
    
    if response.status_code == 200:
        print("✅ LOGIN RÉUSSI!")
        data = response.json()
        print(f"   Token: {data.get('access_token', 'N/A')[:30]}...")
    else:
        print(f"❌ Login échoué: {response.status_code}")
        print(f"   Détail: {response.text}")
        
except Exception as e:
    print(f"❌ Erreur de connexion: {e}")

print("=" * 60)

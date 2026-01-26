"""Test simple du backend"""
import requests

print("🧪 TEST BACKEND SIMPLE")
print("=" * 60)

# Test 1: Health check
print("\n1️⃣ Test Health Check...")
try:
    response = requests.get("http://localhost:8000/health", timeout=3)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Backend accessible: {response.json()}")
    else:
        print(f"   ❌ Erreur: {response.text}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Test 2: Root endpoint
print("\n2️⃣ Test Root Endpoint...")
try:
    response = requests.get("http://localhost:8000/", timeout=3)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ API: {data.get('name')} v{data.get('version')}")
    else:
        print(f"   ❌ Erreur: {response.text}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Test 3: Registration avec gestion d'erreur détaillée
print("\n3️⃣ Test Registration...")
try:
    response = requests.post(
        "http://localhost:8000/auth/register",
        data={
            "username": "test_simple",
            "email": "test@simple.com",
            "password": "Pass123!",
            "full_name": "Test Simple"
        },
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 201:
        print(f"   ✅ Inscription OK!")
        data = response.json()
        print(f"   Token: {data.get('access_token', 'N/A')[:20]}...")
    else:
        print(f"   ❌ Erreur {response.status_code}")
        try:
            error = response.json()
            print(f"   Détail: {error}")
        except:
            print(f"   Réponse: {response.text[:200]}")
            
except Exception as e:
    print(f"   ❌ Exception: {e}")

print("\n" + "=" * 60)

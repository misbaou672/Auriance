"""Test all AURIANCE API endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n🔍 Test: Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_register():
    """Test user registration"""
    print("\n🔍 Test: User Registration")
    data = {
        "username": "newuser",
        "email": "newuser@test.com",
        "password": "newpassword123",
        "full_name": "New User"
    }
    response = requests.post(f"{BASE_URL}/auth/register", data=data)
    print(f"Status: {response.status_code}")
    if response.status_code in [200, 201, 400]:  # 400 if user exists
        print(f"Response: {response.json()}")
        return True
    return False

def test_login():
    """Test user login and get token"""
    print("\n🔍 Test: User Login")
    data = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Token: {result['access_token'][:50]}...")
        return result['access_token']
    return None

def test_create_transcription(token):
    """Test creating a transcription"""
    print("\n🔍 Test: Create Transcription")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "text": "Bonjour, je m'appelle Jean Dupont, mon email est jean@example.com",
        "language": "fr",
        "confidence_score": 95
    }
    response = requests.post(f"{BASE_URL}/data/transcriptions", headers=headers, json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        result = response.json()
        print(f"Transcription ID: {result['id']}")
        return result['id']
    return None

def test_get_transcriptions(token):
    """Test getting all transcriptions"""
    print("\n🔍 Test: Get All Transcriptions")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/data/transcriptions", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Total transcriptions: {len(result)}")
        return True
    return False

def test_auriance_transcribe():
    """Test AURIANCE transcription endpoint (without auth)"""
    print("\n🔍 Test: AURIANCE Transcribe")
    data = {"text": "Test transcription directe"}
    response = requests.post(f"{BASE_URL}/auriance/transcribe", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
        return True
    return False

def test_auriance_extract():
    """Test AURIANCE extraction endpoint"""
    print("\n🔍 Test: AURIANCE Extract")
    data = {"text": "Mon nom est Marie Martin, j'ai 25 ans, email: marie@test.com, tel: 0601020304"}
    response = requests.post(f"{BASE_URL}/auriance/extract", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Extracted fields: {len(result.get('extracted_fields', {}))}")
        print(f"Fields: {result.get('extracted_fields', {})}")
        return True
    return False

def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("🚀 AURIANCE API - Tests Complets")
    print("=" * 60)
    
    results = []
    
    # Test 1: Health
    results.append(("Health Check", test_health()))
    
    # Test 2: Register
    results.append(("User Registration", test_register()))
    
    # Test 3: Login
    token = test_login()
    results.append(("User Login", token is not None))
    
    if token:
        # Test 4: Create transcription
        trans_id = test_create_transcription(token)
        results.append(("Create Transcription", trans_id is not None))
        
        # Test 5: Get transcriptions
        results.append(("Get Transcriptions", test_get_transcriptions(token)))
    
    # Test 6: AURIANCE Transcribe (no auth)
    results.append(("AURIANCE Transcribe", test_auriance_transcribe()))
    
    # Test 7: AURIANCE Extract
    results.append(("AURIANCE Extract", test_auriance_extract()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 RÉSULTATS DES TESTS")
    print("=" * 60)
    
    passed = 0
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} tests réussis")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("❌ Erreur: Le serveur n'est pas accessible sur http://localhost:8000")
        print("   Assurez-vous que le serveur est lancé avec: python run.py")

"""Simple test without emojis"""
import requests
import json

API_URL = "http://localhost:8000"

print("=" * 60)
print("TEST DE CONNEXION SIMPLE")
print("=" * 60)

# Test 1: Health check
print("\n[1] Health Check...")
try:
    r = requests.get(f"{API_URL}/health", timeout=3)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("OK - Backend accessible")
except Exception as e:
    print(f"ERREUR: {e}")
    exit(1)

# Test 2: Login avec utilisateur existant
print("\n[2] Test Login...")
try:
    r = requests.post(
        f"{API_URL}/auth/login",
        data={
            "username": "test_user_1737300444",
            "password": "TestPassword123!"
        },
        timeout=5
    )
    print(f"Status: {r.status_code}")
    
    if r.status_code == 200:
        data = r.json()
        print("SUCCES - Login OK!")
        print(f"Token: {data.get('access_token', '')[:30]}...")
    elif r.status_code == 401:
        print("ECHEC - Mauvais identifiants")
    else:
        print(f"ERREUR {r.status_code}")
        print(f"Reponse: {r.text[:300]}")
        
except Exception as e:
    print(f"ERREUR: {e}")

# Test 3: Registration
print("\n[3] Test Registration...")
import time
ts = int(time.time())
try:
    r = requests.post(
        f"{API_URL}/auth/register",
        data={
            "username": f"user{ts}",
            "email": f"user{ts}@test.com",
            "password": "Pass123!",
            "full_name": "Test User"
        },
        timeout=5
    )
    print(f"Status: {r.status_code}")
    
    if r.status_code == 201:
        data = r.json()
        print("SUCCES - Registration OK!")
        print(f"Token: {data.get('access_token', '')[:30]}...")
    else:
        print(f"ERREUR {r.status_code}")
        print(f"Reponse: {r.text[:500]}")
        
except Exception as e:
    print(f"ERREUR: {e}")

print("\n" + "=" * 60)

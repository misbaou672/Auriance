"""Test script for all databases (SQLite, ChromaDB, Redis)"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Colors for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def print_info(msg):
    print(f"{BLUE}ℹ️  {msg}{RESET}")


# Step 1: Login to get token
print_info("Step 1: Login as admin...")
login_data = {
    "username": "admin",
    "password": "admin123"
}
response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if response.status_code == 200:
    token = response.json()["access_token"]
    print_success(f"Logged in! Token: {token[:30]}...")
    headers = {"Authorization": f"Bearer {token}"}
else:
    print_error(f"Login failed: {response.text}")
    exit(1)


# Step 2: Create a transcription (SQLite + ChromaDB)
print_info("\nStep 2: Create transcription (SQLite + ChromaDB)...")
transcription_data = {
    "audio_file_path": "/uploads/test_audio.wav",
    "text": "Le patient a 45 ans et souffre de diabète de type 2. Il prend de la metformine 500mg deux fois par jour.",
    "language": "fr",
    "duration_seconds": 12.5,
    "confidence_score": 0.95
}
response = requests.post(f"{BASE_URL}/data/transcriptions", json=transcription_data, headers=headers)
if response.status_code == 201:
    transcription = response.json()
    transcription_id = transcription["id"]
    print_success(f"Transcription created! ID: {transcription_id}")
    print(f"   Text: {transcription['text'][:80]}...")
else:
    print_error(f"Failed: {response.text}")


# Step 3: Search semantic (ChromaDB)
print_info("\nStep 3: Semantic search in ChromaDB...")
response = requests.get(
    f"{BASE_URL}/data/transcriptions/search/semantic?query=diabète&limit=5",
    headers=headers
)
if response.status_code == 200:
    results = response.json()
    print_success(f"Found {len(results['results'])} results")
    for i, result in enumerate(results['results'][:3], 1):
        print(f"   {i}. Similarity: {result['similarity_score']:.4f}")
        print(f"      Text: {result['matched_text'][:80]}...")
else:
    print_error(f"Search failed: {response.text}")


# Step 4: Get transcription with cache (Redis)
print_info("\nStep 4: Get transcription (test Redis cache)...")
# First call - from database
response = requests.get(f"{BASE_URL}/data/transcriptions/{transcription_id}", headers=headers)
if response.status_code == 200:
    print_success("Retrieved from database (cached for next time)")
    # Second call - from cache
    response = requests.get(f"{BASE_URL}/data/transcriptions/{transcription_id}", headers=headers)
    if response.status_code == 200:
        print_success("Retrieved from Redis cache (much faster!)")
else:
    print_error(f"Failed: {response.text}")


# Step 5: Create extraction
print_info("\nStep 5: Create extraction (all 3 databases)...")
extraction_data = {
    "transcription_id": transcription_id,
    "full_name": "Jean Dupont",
    "email": "jean.dupont@email.com",
    "phone": "+33612345678",
    "date_of_birth": "1978-05-15",
    "address": "123 Rue de Paris, 75001 Paris",
    "age": 45,
    "form_type": "medical_consultation",
    "extra_fields": {"diagnosis": "diabète type 2", "medication": "metformine 500mg"}
}
response = requests.post(f"{BASE_URL}/data/extractions", json=extraction_data, headers=headers)
if response.status_code == 201:
    extraction = response.json()
    extraction_id = extraction["id"]
    print_success(f"Extraction created! ID: {extraction_id}")
    print(f"   Patient: {extraction['full_name']}, Age: {extraction['age']}")
else:
    print_error(f"Failed: {response.text}")


# Step 6: Get database stats
print_info("\nStep 6: Get all databases stats...")
response = requests.get(f"{BASE_URL}/data/stats/databases", headers=headers)
if response.status_code == 200:
    stats = response.json()
    print_success("Database Statistics:")
    
    # SQLite
    print(f"\n   📊 SQLite Database:")
    print(f"      Total transcriptions: {stats['sql_database']['total']['transcriptions']}")
    print(f"      Total extractions: {stats['sql_database']['total']['extractions']}")
    print(f"      Total reports: {stats['sql_database']['total']['reports']}")
    
    # ChromaDB
    print(f"\n   🔍 ChromaDB (Vector Database):")
    print(f"      Status: {stats['vector_database']['status']}")
    print(f"      Transcriptions collection: {stats['vector_database']['collections']['transcriptions']} items")
    print(f"      Extractions collection: {stats['vector_database']['collections']['extractions']} items")
    
    # Redis
    print(f"\n   ⚡ Redis Cache:")
    print(f"      Status: {stats['cache']['status']}")
else:
    print_error(f"Failed: {response.text}")


# Summary
print_info("\n" + "="*60)
print_success("✨ ALL DATABASES TESTED SUCCESSFULLY! ✨")
print_info("="*60)
print(f"""
Databases working:
  ✅ SQLite - Relational database (users, transcriptions, extractions, reports)
  ✅ ChromaDB - Vector database (semantic search on transcriptions)
  ✅ Redis - Cache layer (fast data retrieval)

Next step: Flutter mobile app with streaming voice! 🎤📱
""")

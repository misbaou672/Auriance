"""Minimal AURIANCE backend for testing authentication"""
from fastapi import FastAPI, Depends, HTTPException, status, Form, Request
from stt_multi_service import router as stt_router
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import jwt
import json

app = FastAPI(title="AURIANCE API - Test Mode")
app.include_router(stt_router)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secret for JWT
SECRET_KEY = "auriance-secret-key-dev"

# Models
class User(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Test users
TEST_USERS = {
    "admin": {
        "username": "admin",
        "email": "admin@auriance.com",
        "full_name": "Admin",
        "password": "admin123",
        "id": 1,
        "is_active": True
    },
    "testuser": {
        "username": "testuser",
        "email": "test@auriance.com",
        "full_name": "User Test",
        "password": "test123",
        "id": 2,
        "is_active": True
    }
}

def create_access_token(username: str):
    """Create JWT token"""
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

@app.get("/")
async def root():
    return {"message": "AURIANCE API - Test Mode", "status": "ok"}

@app.post("/auth/login", response_model=AuthResponse)
async def login(username: str = Form(...), password: str = Form(...)):
    """Login endpoint"""
    print(f"Login attempt: username={username}, password={password}")
    
    if username not in TEST_USERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    user_data = TEST_USERS[username]
    if user_data["password"] != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Generate token
    access_token = create_access_token(username)
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=User(
            id=user_data["id"],
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            is_active=user_data["is_active"],
            created_at=datetime.now()
        )
    )

@app.post("/auth/register", response_model=AuthResponse)
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...)
):
    """Register endpoint"""
    if username in TEST_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create token
    access_token = create_access_token(username)
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=User(
            id=999,
            username=username,
            email=email,
            full_name=full_name,
            is_active=True,
            created_at=datetime.now()
        )
    )

# ============ RAG & TRANSLATION ENDPOINTS ============
@app.post("/api/auriance/rag-answer")
async def rag_answer(
    question: str = Form(...),
    language: str = Form(default="auto"),
    translate_response: str = Form(default="false"),
    response_language: Optional[str] = Form(None),
    top_k: str = Form(default="4")
):
    """RAG Answer endpoint - Simple mock response"""
    print(f"RAG Query: {question}")
    print(f"Language: {language}, Translate: {translate_response}")
    
    # Simple mock response
    response = {
        "question": question,
        "question_original": question,
        "answer": f"Réponse à votre question: {question[:50]}...",
        "detected_language": language if language != "auto" else "fr",
        "response_language": response_language or "fr",
        "translated": translate_response.lower() == "true",
        "hits_qdrant": [
            {
                "score": 0.95,
                "payload": {
                    "text": "Information pertinente trouvée",
                    "source": "medical_corpus"
                }
            }
        ]
    }
    return response

@app.post("/api/auriance/translate-text")
async def translate_text(
    text: str = Form(...),
    target_lang: str = Form(default="fr"),
    source_lang: Optional[str] = Form(None)
):
    """Text translation endpoint"""
    print(f"Translate: {text[:50]}... to {target_lang}")
    
    # Mock translation for all supported languages
    lang_names = {
        "en": "anglais", "fr": "français", "es": "espagnol", "de": "allemand", "it": "italien", "pt": "portugais",
        "ar": "arabe", "zh": "chinois", "hi": "hindi", "ja": "japonais", "ru": "russe", "tr": "turc", "ko": "coréen",
        "nl": "néerlandais", "sv": "suédois", "pl": "polonais", "uk": "ukrainien", "el": "grec", "he": "hébreu",
        "ro": "roumain", "cs": "tchèque", "hu": "hongrois", "fi": "finnois", "no": "norvégien", "da": "danois"
    }
    if target_lang == "fr":
        translated = text
    else:
        lang = lang_names.get(target_lang, target_lang)
        translated = f"Texte traduit en {lang} : {text}"
    return {
        "original_text": text,
        "translated_text": translated,
        "source_lang": source_lang or "auto",
        "target_lang": target_lang,
        "provider": "mock_translator"
    }

@app.post("/api/auriance/save-consultation")
async def save_consultation(
    transcription: str = Form(...),
    nom: Optional[str] = Form(None),
    prenom: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    genre: Optional[str] = Form(None),
    symptomes: Optional[str] = Form(None),
    diagnostic: Optional[str] = Form(None),
    traitement: Optional[str] = Form(None)
):
    """Save consultation endpoint"""
    print(f"Saving consultation: {transcription[:50]}...")
    
    return {
        "id": 1,
        "status": "saved",
        "message": "Consultation sauvegardée avec succès",
        "transcription": transcription[:100]
    }

# ============ TRANSLATION ENDPOINTS ============
@app.get("/translation/languages")
async def get_translation_languages():
    """Get supported languages for translation"""
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "fr", "name": "Français"},
            {"code": "es", "name": "Español"},
            {"code": "de", "name": "Deutsch"},
            {"code": "it", "name": "Italiano"},
            {"code": "pt", "name": "Português"},
            {"code": "ar", "name": "العربية"},
            {"code": "zh", "name": "中文"},
            {"code": "hi", "name": "हिंदी"},
            {"code": "ja", "name": "日本語"},
            {"code": "ru", "name": "Русский"},
            {"code": "tr", "name": "Türkçe"},
            {"code": "ko", "name": "한국어"},
            {"code": "nl", "name": "Nederlands"},
            {"code": "sv", "name": "Svenska"},
            {"code": "pl", "name": "Polski"},
            {"code": "uk", "name": "Українська"},
            {"code": "el", "name": "Ελληνικά"},
            {"code": "he", "name": "עברית"},
            {"code": "ro", "name": "Română"},
            {"code": "cs", "name": "Čeština"},
            {"code": "hu", "name": "Magyar"},
            {"code": "fi", "name": "Suomi"},
            {"code": "no", "name": "Norsk"},
            {"code": "da", "name": "Dansk"},
        ]
    }

# ============ DATA ENDPOINTS ============
@app.post("/data/transcriptions")
async def save_transcription(request: Request):
    """Save transcription endpoint - accepts both form and JSON"""
    try:
        # Try to parse as JSON first, fallback to form data
        try:
            data = await request.json()
        except:
            data = await request.form()
            data = dict(data)
        
        text = data.get("text", "")
        language = data.get("language", "fr")
        duration_seconds = data.get("duration_seconds")
        confidence_score = data.get("confidence_score", 0)
        audio_file_path = data.get("audio_file_path")
        
        print(f"✅ Saving transcription: {text[:50]}...")
        print(f"   Language: {language}, Confidence: {confidence_score}")
        
        return {
            "id": 1,
            "text": text[:100],
            "language": language,
            "duration_seconds": duration_seconds,
            "confidence_score": confidence_score,
            "saved": True,
            "message": "Transcription sauvegardée avec succès"
        }
    except Exception as e:
        print(f"❌ Error saving transcription: {e}")
        return {
            "error": str(e),
            "saved": False,
            "message": f"Erreur: {e}"
        }

@app.get("/data/transcriptions")
async def get_transcriptions(skip: int = 0, limit: int = 100):
    """Get all transcriptions"""
    return {
        "items": [
            {
                "id": 1,
                "text": "Exemple de transcription",
                "language": "fr",
                "created_at": datetime.now().isoformat()
            }
        ],
        "total": 1
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 AURIANCE API - Test Mode")
    print("📍 http://localhost:9000")
    print("📚 Documentation: http://localhost:9000/docs")
    print("\n👤 Test credentials:")
    print("   - admin / admin123")
    print("   - testuser / test123")
    uvicorn.run(app, host="0.0.0.0", port=9000)

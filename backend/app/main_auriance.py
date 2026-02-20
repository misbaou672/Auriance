"""AURIANCE - Moteur Vocal Intelligent B2B

Point d'entrée principal de l'API FastAPI avec Base de Données.
"""

import sys
import os

# --- Windows console robustness ---
# Some environments use a legacy code page (cp1252) which can crash on emojis
# used in logs/prints (UnicodeEncodeError: 'charmap'). Force UTF-8 with
# replacement to keep the server running.
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Charge .env au démarrage
load_dotenv()

# Importer les routes
from app.api.routes.auriance_routes import router as auriance_router
from app.api.routes.auth_routes import router as auth_router
from app.api.routes.data_routes import router as data_router
from app.api.routes.demo_routes import router as demo_router
from app.api.routes.medical_routes import router as medical_router
from app.api.routes.admin_routes import router as admin_router
from app.api.routes.translation_routes import router as translation_router
from app.api.routes.voice_stream_routes import router as voice_stream_router
from app.api.routes.voice_recognition_routes import router as voice_recognition_router
from app.api.routes.chatbot_routes import router as chatbot_router
from app.api.routes.assistant_routes import router as assistant_router

# Importer DB
from app.db.session import init_db
from app.services.translation_service import TranslationService

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Crée l'application FastAPI."""
    app = FastAPI(
        title="AURIANCE - Intelligent Voice Engine v2.0",
        description="""
        🎤 **AURIANCE** est un moteur vocal intelligent B2B qui transforme la parole en actions automatiques.
        
        ## Fonctionnalités principales:
        
        1. **Authentification**: Système JWT sécurisé
        2. **Transcription**: Convertir l'audio en texte avec Whisper
        3. **Extraction NLP**: Extraire les infos du texte (nom, email, téléphone, etc.)
        4. **Génération JSON**: Remplir automatiquement les formulaires
        5. **Requêtes SQL**: Générer des requêtes SQL basées sur l'intention
        6. **Requêtes Cypher**: Générer des requêtes Neo4j pour les graphes
        7. **Rapports**: Créer des rapports structurés
        8. **Base de Données**: Stockage persistent PostgreSQL
        
        ## Cas d'usage:
        - 🏥 **Médecine**: Comptes-rendus de consultation automatiques
        - 🌿 **Biodiversité**: Fiches d'observation auto-remplies
        - 📋 **Administratif**: Formulaires remplis par la voix
        - 🏢 **Entreprise**: Intégration dans n'importe quelle app métier
        
        ## Architecture:
        ```
        Audio → Whisper (transcription) → NLP (extraction)
             ↓
        → JSON (formulaires) ou SQL/Cypher (requêtes) ou Rapports
        ```
        """,
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8090",
            "http://127.0.0.1:8090",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialiser la BD au démarrage
    logger.info("🚀 Démarrage d'AURIANCE...")
    try:
        init_db()
        logger.info("✅ Base de données initialisée")
        app.state.db_unavailable = False
    except Exception as e:
        logger.warning(f"⚠️ BD non accessible (mode développement): {e}")
        app.state.db_unavailable = True
    
    logger.info("✅ AURIANCE prêt!")
    return app


# Créer l'application
app = create_app()


# ==================== ROUTES ====================

@app.get("/")
async def root():
    """Route racine avec info de l'API."""
    return {
        "name": "AURIANCE",
        "version": "1.0.0",
        "status": "🟢 Online",
        "description": "Intelligent Voice Engine B2B",
        "docs": "/docs",
        "docs_redoc": "/redoc",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Vérification de santé de l'API."""
    return {
        "status": "🟢 Healthy",
        "message": "AURIANCE is running"
    }


# Inclure les routes - commenté temporairement pour debug
app.include_router(auth_router)
app.include_router(data_router)
app.include_router(auriance_router)
app.include_router(demo_router)
app.include_router(medical_router)
app.include_router(admin_router)
app.include_router(translation_router)
app.include_router(voice_stream_router)
app.include_router(voice_recognition_router)
app.include_router(chatbot_router)
app.include_router(assistant_router)

# ==================== TRANSLATION SHORTCUTS ====================
@app.get("/translation/languages")
async def translation_languages():
    """Expose supported languages directly from main app."""
    service = TranslationService()
    data = service.get_supported_languages()
    return {"status": "success", "data": data}

@app.get("/translation/health")
async def translation_health():
    service = TranslationService()
    langs = service.get_supported_languages()
    return {
        "status": "healthy",
        "service": "Translation Service",
        "supported_languages": langs["total"],
    }


# ===================== DEBUG: Test endpoint =========================
from fastapi import Form

@app.post("/api/auriance/translate-text")
async def test_translate_text(
    text: str = Form(...),
    target_lang: str = Form("fr"),
    source_lang: str = Form(None),
):
    """Test endpoint to verify routing works."""
    return {
        "success": True,
        "detected_language": "en",
        "language_confidence": 0.95,
        "target_language": target_lang,
        "original_text": text,
        "translated_text": f"TRANSLATED: {text}",
    }


# ==================== EXCEPTION HANDLERS ====================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Gestionnaire global des exceptions."""
    logger.error(f"Erreur non gérée: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Erreur interne du serveur", "detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    
    logger.info("🎤 Démarrage du serveur AURIANCE...")
    logger.info("📖 Docs disponibles à: http://localhost:8090/docs")
    
    uvicorn.run(
        "app.main_auriance:app",
        host="0.0.0.0",
        port=8090,
        reload=True,
        log_level="info"
    )

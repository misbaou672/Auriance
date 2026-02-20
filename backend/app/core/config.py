import os
from dotenv import load_dotenv

# Charge les variables d'environnement depuis le fichier .env
load_dotenv()

# Database (default to SQLite for development; override via env for production)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./auriance.db"
)

# Vector DB (Qdrant)
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

# Graph DB (Neo4j)
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4jpass123")

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Whisper
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")

# API
API_TITLE = "AURIANCE API"
API_VERSION = "2.0.0"
API_DESCRIPTION = "Voice-to-Action Intelligence Platform"

# Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# CORS
CORS_ORIGINS = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:8080",
]

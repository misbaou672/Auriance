"""
Serveur FastAPI minimal pour AURIANCE sans lifespan (workaround Windows)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.auriance_routes import router as auriance_router

# Application FastAPI SANS lifespan
app = FastAPI(
    title="AURIANCE API",
    description="API vocale intelligente pour remplissage automatique de formulaires",
    version="1.0.0",
    lifespan=None  # Désactiver complètement le lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auriance_router)

@app.get("/")
async def root():
    return {
        "message": "AURIANCE API - Serveur opérationnel",
        "endpoints": {
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

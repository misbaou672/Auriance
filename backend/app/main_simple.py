"""Serveur FastAPI minimal pour AURIANCE - Formulaire Auto-Rempli"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.auriance_routes import router as auriance_router

# Application FastAPI
app = FastAPI(
    title="AURIANCE API",
    description="API vocale intelligente pour remplissage automatique de formulaires",
    version="1.0.0"
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
            "form_json": "/api/auriance/form-json"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Serveur AURIANCE démarré!")
    print("📡 http://0.0.0.0:8000")
    print("📚 Documentation: http://0.0.0.0:8000/docs")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

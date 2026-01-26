#!/usr/bin/env python3
"""
Serveur AURIANCE - Avec keepalive dans la boucle asyncio
"""
import asyncio
import logging
import sys
import threading
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import uvicorn

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Endpoints simples
async def health_endpoint(request):
    return JSONResponse({"status": "healthy", "version": "1.0.0", "ready": True})

async def root_endpoint(request):
    return JSONResponse({
        "message": "AURIANCE API - Serveur opérationnel",
        "endpoints": {"health": "/health"}
    })

# Routes
routes = [
    Route("/health", health_endpoint, methods=["GET"]),
    Route("/", root_endpoint, methods=["GET"]),
]

# Application Starlette
app = Starlette(routes=routes, lifespan=None)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_server():
    """Démarrer le serveur Uvicorn"""
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    logger.info("🚀 Démarrage du serveur AURIANCE...")
    
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=9999,
        log_level="info"
    )
    
    server = uvicorn.Server(config)
    
    # Créer une nouvelle boucle événement pour ce thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        loop.run_until_complete(server.serve())
    except KeyboardInterrupt:
        logger.info("Arrêt du serveur...")
    finally:
        loop.close()

if __name__ == "__main__":
    try:
        run_server()
    except Exception as e:
        logger.error(f"Erreur: {e}", exc_info=True)
        sys.exit(1)

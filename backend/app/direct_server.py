#!/usr/bin/env python3
"""
Démarrage du serveur AURIANCE avec asyncio direct
Workaround pour le problème Windows/Uvicorn lifespan
"""
import asyncio
import logging
import sys
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import uvicorn
import signal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Endpoints simples
async def health_endpoint(request):
    return JSONResponse({"status": "healthy", "version": "1.0.0"})

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

async def main():
    """Démarrer le serveur avec uvicorn via asyncio"""
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        lifespan="off"  # Désactiver lifespan complètement
    )
    server = uvicorn.Server(config)
    
    # Garder le serveur vivant indéfiniment
    logger.info("Server started, keeping alive...")
    try:
        await server.serve()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        server.should_exit = True

if __name__ == "__main__":
    # Utiliser le correct event loop policy pour Windows
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped")
        sys.exit(0)

#!/usr/bin/env python3
"""
Démarrage du serveur AURIANCE - Version avec keepalive
"""
import asyncio
import logging
import sys
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import uvicorn

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

if __name__ == "__main__":
    # Utiliser le correct event loop policy pour Windows
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    # Démarrer avec uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5555,
        log_level="info",
        lifespan="off",
        access_log=True
    )

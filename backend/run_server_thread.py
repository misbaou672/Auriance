#!/usr/bin/env python3
"""
Serveur AURIANCE - Worker thread
"""
import sys
import os

# S'assurer que le cwd est correct
os.chdir("c:\\Users\\marec\\Documents\\auriance\\backend")
sys.path.insert(0, ".")

import threading
import time
import logging
import uvicorn
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Endpoints
async def health_endpoint(request):
    return JSONResponse({"status": "healthy"})

async def root_endpoint(request):
    return JSONResponse({"message": "OK"})

# App
app = Starlette(routes=[
    Route("/health", health_endpoint, methods=["GET"]),
    Route("/", root_endpoint, methods=["GET"]),
], lifespan=None)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def run_uvicorn():
    """Exécuter uvicorn dans un thread séparé"""
    logger.info("🚀 Serveur démarrant sur port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

if __name__ == "__main__":
    # Démarrer uvicorn dans un thread
    server_thread = threading.Thread(target=run_uvicorn, daemon=False)
    server_thread.start()
    
    # Main thread reste actif
    logger.info("✅ Serveur lancé")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Arrêt...")
        sys.exit(0)

#!/usr/bin/env python3
"""
Serveur AURIANCE qui teste lui-même
"""
import sys
import os
import time
import threading
import requests
import logging

os.chdir("c:\\Users\\marec\\Documents\\auriance\\backend")
sys.path.insert(0, ".")

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')
logger = logging.getLogger(__name__)

import uvicorn
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

# App
async def health(req):
    return JSONResponse({"status": "healthy", "timestamp": time.time()})

async def root(req):
    return JSONResponse({"message": "OK"})

app = Starlette(routes=[
    Route("/health", health, methods=["GET"]),
    Route("/", root, methods=["GET"]),
], lifespan=None)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def run_server():
    """Lancer le serveur"""
    logger.info("🚀 Démarrage du serveur sur port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

def test_server():
    """Tester le serveur toutes les 2 secondes"""
    time.sleep(2)  # Laisser le serveur démarrer
    
    for i in range(100):
        try:
            logger.info(f"[Test {i}] Envoi requête...")
            response = requests.get("http://localhost:8000/health", timeout=2)
            logger.info(f"✅ Réponse {response.status_code}: {response.json()}")
        except Exception as e:
            logger.error(f"❌ Erreur: {e}")
        
        time.sleep(2)

if __name__ == "__main__":
    # Démarrer le serveur dans un thread
    server_thread = threading.Thread(target=run_server, daemon=False)
    server_thread.start()
    
    # Démarrer les tests dans le main thread
    logger.info("✅ Serveur lancé, commençant tests...")
    test_server()

#!/usr/bin/env python3
"""
Serveur AURIANCE - Version DEBUG avec logs détaillés
"""
import asyncio
import logging
import sys
import os
sys.stdout.flush()  # Force write immédiat

# Configuration du logging AVANT tout
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('server_debug.log', mode='w', encoding='utf-8')
    ]
)

logger = logging.getLogger(__name__)
logger = logging.getLogger()

logger.info("="*60)
logger.info("DÉMARRAGE DU SERVEUR - VERSION DEBUG")
logger.info("="*60)

from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

logger.info("✅ Imports Starlette OK")

import uvicorn

logger.info("✅ Imports uvicorn OK")

# Endpoints simples
async def health_endpoint(request):
    logger.debug("GET /health appelé")
    return JSONResponse({"status": "healthy", "version": "1.0.0"})

async def root_endpoint(request):
    logger.debug("GET / appelé")
    return JSONResponse({"message": "AURIANCE API OK"})

# Routes
routes = [
    Route("/health", health_endpoint, methods=["GET"]),
    Route("/", root_endpoint, methods=["GET"]),
]

logger.info("✅ Routes créées")

# Application Starlette
app = Starlette(routes=routes, lifespan=None)

logger.info("✅ Application Starlette créée")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("✅ Middleware CORS ajouté")

if __name__ == "__main__":
    logger.info("\n" + "="*60)
    logger.info("LANCEMENT UVICORN")
    logger.info("="*60 + "\n")
    
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        logger.info("✅ Windows event loop policy défini")
    
    try:
        logger.info("Création de la config uvicorn...")
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=9999,
            log_level="debug",
            access_log=True
        )
        logger.info("✅ Config créée")
        
        logger.info("Création du server uvicorn...")
        server = uvicorn.Server(config)
        logger.info("✅ Server créé")
        
        logger.info("Création nouvelle event loop...")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        logger.info("✅ Event loop créée")
        
        logger.info("\n" + "="*60)
        logger.info("EXÉCUTION DU SERVEUR")
        logger.info("="*60 + "\n")
        
        loop.run_until_complete(server.serve())
        
    except Exception as e:
        logger.error(f"❌ EXCEPTION: {e}", exc_info=True)
        sys.exit(1)
    finally:
        logger.info("\n" + "="*60)
        logger.info("FIN DU SERVEUR")
        logger.info("="*60)
        loop.close()

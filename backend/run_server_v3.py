#!/usr/bin/env python3
"""
Serveur AURIANCE avec gestion des signaux
"""
import asyncio
import logging
import sys
import signal
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

class ServerRunner:
    def __init__(self):
        self.server = None
        self.should_exit = False
    
    def signal_handler(self, signum, frame):
        logger.info(f"Signal {signum} reçu, arrêt gracieux...")
        self.should_exit = True
        if self.server:
            self.server.should_exit = True
    
    def run(self):
        """Démarrer le serveur Uvicorn"""
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
        # Enregistrer les gestionnaires de signaux
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        logger.info("🚀 Démarrage du serveur AURIANCE...")
        
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=9999,
            log_level="info"
        )
        
        self.server = uvicorn.Server(config)
        
        # Créer une nouvelle boucle événement pour ce thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            logger.info("✅ Serveur en cours d'exécution, appuyez sur Ctrl+C pour arrêter")
            loop.run_until_complete(self.server.serve())
        except KeyboardInterrupt:
            logger.info("Arrêt du serveur...")
        finally:
            loop.close()

if __name__ == "__main__":
    try:
        runner = ServerRunner()
        runner.run()
    except Exception as e:
        logger.error(f"Erreur: {e}", exc_info=True)
        sys.exit(1)

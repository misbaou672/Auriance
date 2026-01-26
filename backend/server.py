#!/usr/bin/env python3
"""
Serveur AURIANCE COMPLET avec routes FastAPI
"""
import sys
import os
os.chdir("c:\\Users\\marec\\Documents\\auriance\\backend")
sys.path.insert(0, ".")

import uvicorn

if __name__ == "__main__":
    # Démarrer le serveur avec les routes complètes
    uvicorn.run(
        "app.main_simple:app",  # Utiliser la simple version FastAPI
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
        access_log=True
    )

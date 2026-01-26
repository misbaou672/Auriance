#!/usr/bin/env python3
"""Run AURIANCE Backend"""
import sys
import os

# Ajouter le dossier backend au path
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main_auriance:app",
        host="0.0.0.0",
        port=8090,
        reload=False,  # Désactiver le reload qui cause des problèmes
        log_level="info"
    )

#!/usr/bin/env python3
"""Direct run of AURIANCE with asyncio"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    import asyncio
    import uvicorn
    from app.main_simple import app
    
    # Patch asyncio pour Windows
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        lifespan="off",  # Désactiver lifespan
    )
    server = uvicorn.Server(config)
    try:
        asyncio.run(server.serve())
    except KeyboardInterrupt:
        print("\n✅ Serveur arrêté")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()


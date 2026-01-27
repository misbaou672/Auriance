
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

print("Starting import debug...")

def log(msg):
    print(f"[DEBUG] {msg}")
    sys.stdout.flush()

try:
    log("Importing logging...")
    import logging
    log("Importing fastapi...")
    from fastapi import FastAPI
    log("Importing dotenv...")
    from dotenv import load_dotenv
    log("Loading dotenv...")
    load_dotenv()

    log("Importing app.api.routes.auriance_routes...")
    from app.api.routes.auriance_routes import router as auriance_router
    log("Importing app.api.routes.auth_routes...")
    from app.api.routes.auth_routes import router as auth_router
    log("Importing app.api.routes.data_routes...")
    from app.api.routes.data_routes import router as data_router
    log("Importing app.api.routes.demo_routes...")
    from app.api.routes.demo_routes import router as demo_router
    log("Importing app.api.routes.medical_routes...")
    from app.api.routes.medical_routes import router as medical_router
    log("Importing app.api.routes.admin_routes...")
    from app.api.routes.admin_routes import router as admin_router
    log("Importing app.api.routes.translation_routes...")
    from app.api.routes.translation_routes import router as translation_router
    log("Importing app.api.routes.voice_stream_routes...")
    from app.api.routes.voice_stream_routes import router as voice_stream_router
    log("Importing app.api.routes.voice_recognition_routes...")
    from app.api.routes.voice_recognition_routes import router as voice_recognition_router
    log("Importing app.api.routes.chatbot_routes...")
    from app.api.routes.chatbot_routes import router as chatbot_router

    log("Importing app.db.session...")
    from app.db.session import init_db
    log("Importing app.services.translation_service...")
    from app.services.translation_service import TranslationService
    
    log("All imports successful!")

except Exception as e:
    log(f"CRASH during import: {e}")
    import traceback
    traceback.print_exc()

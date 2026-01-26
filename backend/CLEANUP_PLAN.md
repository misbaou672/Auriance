"""
Fichiers à nettoyer/archiver - Migration vers FastAPI AURIANCE

Ces fichiers sont des implémentations anciennes avec Flask et SocketIO.
L'architecture FastAPI moderne les remplace.
"""

# ==================== FICHIERS À SUPPRIMER ====================

FILES_TO_DELETE = [
    # Anciens serveurs Flask
    "app/services/auriance_server.py",
    "app/services/auriance_server_fixed.py",
    "app/services/auriance_turbo_pro_server.py",
    "app/services/auriance_turbo_pro_server_backup.py",
    "app/services/auriance_turbo_pro_server_optimized.py",
    
    # Anciens clients desktop
    "desktop/auriance_client.py",
    "desktop/auriance_turbo_pro_client.py",
    "desktop/client_simple.py",
    
    # Anciens tests
    "test_db.py",
    "test_simple.py",
    "test_streaming_complet.py",
    "test_users.py",
    "test_whisper.py",
    "test_whisper_demo.py",
    
    # Fichiers de configuration locaux
    ".venv/",
    "venv/",
    "__pycache__/",
    "*.pyc",
    "aurian_env/",
    
    # Anciennes bases de données (créer de nouvelles avec init_database.py)
    "aurian_complete.db",
    "aurian_conversations.db",
    "aurian_smart.db",
    "auriance.db",
]

# ==================== FICHIERS À CONSERVER ====================

FILES_TO_KEEP = [
    # Nouvelles routes FastAPI
    "app/api/routes/auriance_routes.py",  # ✨ NEW
    
    # Nouveaux services
    "app/services/whisper_service.py",  # ✨ NEW
    "app/services/nlp_service.py",  # ✨ NEW
    "app/services/query_generation_service.py",  # ✨ NEW
    "app/services/report_generation_service.py",  # ✨ NEW
    
    # Configuration
    "app/main_auriance.py",  # ✨ NEW - Main FastAPI
    "app/core/config.py",  # Configuration partagée
    
    # Database
    "create_tables.py",  # Créer les tables
    "init_database.py",  # Initialiser la DB
    
    # Frontend
    "templates/",
    "static/",
]

# ==================== FICHIERS À ARCHIVER ====================

ARCHIVE_THESE = [
    # Peut être utile comme référence
    "app/services/mobile_voice_service.py",  # Concept bon, mais remplacé
    "app/services/database_service.py",  # À migrer vers SQLAlchemy
    "app/services/auth_service.py",  # À intégrer dans FastAPI
    "app/services/llm_service.py",  # À moderniser
    "app/services/main_orchestrator_service.py",  # À adapter
]

# ==================== MIGRATION CHECKLIST ====================

MIGRATION_CHECKLIST = """
✅ MIGRATION CHECKLIST - De Flask → FastAPI

FAIT:
  ✓ Créer app/api/routes/auriance_routes.py (FastAPI)
  ✓ Créer services modernes (Whisper, NLP, Query, Report)
  ✓ Créer main_auriance.py avec FastAPI
  ✓ Mettre à jour requirements.txt
  ✓ Créer documentation README_AURIANCE.md

À FAIRE:
  [ ] Migrer database_service.py vers SQLAlchemy ORM
  [ ] Migrer auth_service.py vers FastAPI + JWT
  [ ] Adapter llm_service.py pour l'integration
  [ ] Archiver les fichiers inutiles
  [ ] Tester les routes sur http://localhost:8000/docs
  [ ] Mettre à jour les clients (mobile, web, desktop)
  [ ] Configurer CI/CD

COMMANDES UTILES:
  
  # Démarrer le serveur
  python -m uvicorn app.main_auriance:app --reload
  
  # Voir les logs
  tail -f auriance_server.log
  
  # Nettoyer les fichiers
  rm -r app/services/auriance_server*.py
  rm -r desktop/*
  
  # Archiver les anciens fichiers
  mkdir -p archive
  mv app/services/old_service.py archive/
"""

print(MIGRATION_CHECKLIST)

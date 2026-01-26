#!/usr/bin/env python3
import sys
import os

# Ajouter le chemin pour importer depuis app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def test_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"📊 Nombre d'users dans la BD: {len(users)}")
        
        for user in users:
            print(f" - {user.email} ({user.role})")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_users()
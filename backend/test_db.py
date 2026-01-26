# test_db.py - À LA RACINE du dossier backend
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def test_connection():
    db = SessionLocal()
    try:
        # Test simple
        users_count = db.query(User).count()
        print(f"📊 Nombre d'utilisateurs: {users_count}")
        print("✅ Connexion BD réussie")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_connection()
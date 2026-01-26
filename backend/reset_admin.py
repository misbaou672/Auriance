import sys
import os

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.crud.user_crud import get_user_by_username, create_user, update_user
from app.schemas import UserCreate
from app.services.auth_service import get_password_hash

def reset_admin():
    print("🔄 Réinitialisation du compte admin...")
    db = SessionLocal()
    try:
        # MANUAL MIGRATION BLOCK
        try:
            from sqlalchemy import text
            print("🛠️ Vérification du schéma de la base de données...")
            # Tentative d'ajout des colonnes manquantes (bricolage pour éviter Alembic complet)
            # Postgres syntax
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'patient'"))
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR UNIQUE"))
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'fr'"))
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR"))
            db.commit()
            print("✅ Schéma mis à jour (colonnes ajoutées si manquantes).")
        except Exception as e:
            print(f"⚠️ Avertissement migration: {e}")
            db.rollback()

        username = "admin"
        password = "admin123"
        
        user = get_user_by_username(db, username)
        if not user:
            print(f"➕ Création de l'utilisateur '{username}'...")
            create_user(
                db,
                UserCreate(
                    username=username,
                    email="admin@auriance.com",
                    password=password,
                    full_name="Admin User",
                ),
            )
            print(f"✅ Utilisateur '{username}' créé avec succès.")
        else:
            print(f"✏️  Mise à jour du mot de passe pour '{username}'...")
            # Update connection state to ensure we see new columns
            db.commit()
            
            # Re-fetch user or update directly
            update_user(db, user.id, {
                "hashed_password": get_password_hash(password),
                "role": "admin",
                "is_active": True
            })
            print(f"✅ Mot de passe réinitialisé pour '{username}'.")
            
        print(f"\n🔑 Identifiants confirmés :")
        print(f"   Utilisateur : {username}")
        print(f"   Mot de passe : {password}")
        
    except Exception as e:
        print(f"❌ Erreur : {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()

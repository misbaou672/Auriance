# Script pour créer un compte admin par défaut si inexistant
from app.db.session import SessionLocal
from app.crud.user_crud import get_user_by_username, create_user
from app.schemas import UserCreate

def create_admin():
    db = SessionLocal()
    admin = get_user_by_username(db, "admin")
    from app.services.auth_service import get_password_hash
    if admin:
        admin.hashed_password = get_password_hash("admin123")
        db.commit()
        print("🔑 Mot de passe admin réinitialisé (admin/admin123)")
    else:
        user = UserCreate(
            username="admin",
            email="admin@auriance.local",
            password="admin123",
            full_name="Administrateur"
        )
        create_user(db, user)
        print("✅ Utilisateur admin créé (admin/admin123)")
    db.close()

if __name__ == "__main__":
    create_admin()

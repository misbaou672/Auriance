# Script pour tester la vérification du mot de passe admin
from app.db.session import SessionLocal
from app.crud.user_crud import get_user_by_username
from app.services.auth_service import verify_password

def test_admin_password():
    db = SessionLocal()
    admin = get_user_by_username(db, "admin")
    if not admin:
        print("❌ Utilisateur admin introuvable.")
        db.close()
        return
    db_hash = admin.hashed_password
    ok = verify_password("admin123", db_hash)
    if ok:
        print("✅ La vérification du mot de passe admin123 RÉUSSIT.")
    else:
        print("❌ La vérification du mot de passe admin123 ÉCHOUE.")
    db.close()

if __name__ == "__main__":
    test_admin_password()

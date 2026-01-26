# Script pour afficher et comparer le hash du mot de passe admin
from app.db.session import SessionLocal
from app.crud.user_crud import get_user_by_username
from app.services.auth_service import get_password_hash

def compare_admin_hash():
    db = SessionLocal()
    admin = get_user_by_username(db, "admin")
    if not admin:
        print("❌ Utilisateur admin introuvable.")
        db.close()
        return
    db_hash = admin.hashed_password
    expected_hash = get_password_hash("admin123")
    print(f"Hash dans la base : {db_hash}")
    print(f"Hash généré pour 'admin123' : {expected_hash}")
    if db_hash == expected_hash:
        print("✅ Les deux hash sont IDENTIQUES.")
    else:
        print("❌ Les deux hash sont DIFFÉRENTS.")
    db.close()

if __name__ == "__main__":
    compare_admin_hash()

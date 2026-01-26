from app.db.session import SessionLocal
from app.crud.user_crud import get_user_by_username
from app.services.auth_service import get_password_hash

db = SessionLocal()
try:
    u = get_user_by_username(db, 'emma')
    if u:
        u.hashed_password = get_password_hash('password123')
        db.commit()
        print("✅ Mot de passe mis à jour pour 'emma' (emma@auriance.com) -> password123")
    else:
        print("❌ Utilisateur 'emma' non trouvé")

    u2 = get_user_by_username(db, 'emma_moreau')
    if u2:
        u2.hashed_password = get_password_hash('password123')
        db.commit()
        print(f"✅ Mot de passe mis à jour pour 'emma_moreau' ({u2.email}) -> password123")
except Exception as e:
    print(f"Erreur: {e}")
finally:
    db.close()

#!/usr/bin/env python3
"""Script pour créer l'utilisateur Emma"""
from app.db.session import SessionLocal
from app.crud.user_crud import get_user_by_username, create_user
from app.schemas import UserCreate

db = SessionLocal()

try:
    # Vérifier si Emma existe
    existing = get_user_by_username(db, 'emma')
    
    if existing:
        print(f"✅ L'utilisateur 'emma' existe déjà")
        print(f"   Email: {existing.email}")
        print(f"   ID: {existing.id}")
    else:
        # Créer Emma
        user = create_user(
            db, 
            UserCreate(
                username='emma',
                email='emma@auriance.com',
                password='emma123',
                full_name='Emma'
            )
        )
        print(f"✅ Utilisateur 'emma' créé avec succès!")
        print(f"   Email: {user.email}")
        print(f"   ID: {user.id}")
        
except Exception as e:
    print(f"❌ Erreur: {e}")
finally:
    db.close()

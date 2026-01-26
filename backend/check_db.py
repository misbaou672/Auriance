"""Script simple pour vérifier les utilisateurs dans la BD"""
import os
import sys
from sqlalchemy import create_engine, text

# URL de la base de données depuis .env
DATABASE_URL = "postgresql://postgres:110603@localhost:5432/auriance_medical"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, username, email, full_name, created_at FROM users ORDER BY created_at DESC"))
        users = result.fetchall()
        
        print("=" * 80)
        print(f"📊 UTILISATEURS DANS LA BASE DE DONNÉES ({len(users)} total)")
        print("=" * 80)
        
        if users:
            for user in users:
                print(f"ID: {user[0]}")
                print(f"  👤 Username: {user[1]}")
                print(f"  📧 Email: {user[2]}")
                print(f"  📝 Nom complet: {user[3]}")
                print(f"  📅 Créé le: {user[4]}")
                print("-" * 80)
        else:
            print("⚠️  Aucun utilisateur trouvé dans la base de données")
            print("💡 Essayez de créer un compte via le site web")
        
        print("=" * 80)
        
except Exception as e:
    print(f"❌ Erreur de connexion à la base de données: {e}")
    print("\n💡 Vérifiez que:")
    print("   1. PostgreSQL est démarré")
    print("   2. La base 'auriance_medical' existe")
    print("   3. Les identifiants sont corrects (postgres:110603)")

"""Vérifier que la table users existe et a le bon schéma"""
from sqlalchemy import create_engine, text, inspect

DATABASE_URL = "postgresql://postgres:110603@localhost:5432/auriance_medical"

print("🔍 VÉRIFICATION DE LA BASE DE DONNÉES")
print("=" * 60)

try:
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    # Vérifier si la table users existe
    tables = inspector.get_table_names()
    print(f"\n📋 Tables dans la BD: {', '.join(tables)}")
    
    if 'users' in tables:
        print("\n✅ Table 'users' trouvée!")
        
        # Voir les colonnes
        columns = inspector.get_columns('users')
        print("\n📊 Colonnes de la table 'users':")
        for col in columns:
            nullable = "NULL" if col['nullable'] else "NOT NULL"
            print(f"   • {col['name']}: {col['type']} ({nullable})")
        
        # Compter les utilisateurs
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = result.fetchone()[0]
            print(f"\n👥 Nombre d'utilisateurs: {count}")
            
    else:
        print("\n❌ Table 'users' NON trouvée!")
        print("💡 Il faut créer les tables. Exécutez:")
        print("   python -c \"from app.db.session import init_db; init_db()\"")
        
except Exception as e:
    print(f"\n❌ Erreur: {e}")
    print("\n💡 Vérifiez:")
    print("   1. PostgreSQL est démarré")
    print("   2. La BD 'auriance_medical' existe")
    print("   3. Les identifiants sont corrects")

print("\n" + "=" * 60)

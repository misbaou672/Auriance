"""Initialize database and create test users"""
import sys

sys.path.insert(0, ".")

from dotenv import load_dotenv

load_dotenv()

from app.db.session import init_db, SessionLocal
from app.crud.user_crud import create_user
from app.schemas import UserCreate
from app.models.rag_query import RagQuery  # Ensure table is registered

def init_database():
    """Initialize database with tables and test data"""
    print("🔧 Initialisation de la base de données...")
    
    # Create all tables
    init_db()
    print("✅ Tables créées!")
    
    # Create test users
    db = SessionLocal()
    try:
        # Admin user
        admin = UserCreate(
            username="admin",
            email="admin@auriance.com",
            password="admin123",  # Keep under 72 chars for bcrypt
            full_name="Admin"
        )
        
        try:
            user = create_user(db, admin)
            print(f"✅ Utilisateur admin créé: {user.username}")
        except Exception as e:
            print(f"⚠️ Admin existe déjà ou erreur: {e}")
        
        # Test user
        test_user = UserCreate(
            username="testuser",
            email="test@auriance.com",
            password="test123",  # Keep under 72 chars for bcrypt
            full_name="User Test"
        )
        
        try:
            user = create_user(db, test_user)
            print(f"✅ Utilisateur test créé: {user.username}")
        except Exception as e:
            print(f"⚠️ User test existe déjà ou erreur: {e}")
            
        print("\n🎉 Base de données initialisée avec succès!")
        print("\n📝 Identifiants de test:")
        print("   Username: admin / Password: admin123")
        print("   Username: testuser / Password: test123")
        
    finally:
        db.close()

if __name__ == "__main__":
    init_database()

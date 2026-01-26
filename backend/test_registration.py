"""Test d'inscription et vérification dans la BD"""
import requests
import time
from sqlalchemy import create_engine, text

# Configuration
API_URL = "http://localhost:8000"
DATABASE_URL = "postgresql://postgres:110603@localhost:5432/auriance_medical"

def test_registration():
    """Teste l'inscription d'un nouvel utilisateur"""
    print("🧪 TEST D'INSCRIPTION")
    print("=" * 60)
    
    # Données de test avec timestamp pour éviter les doublons
    timestamp = int(time.time())
    test_data = {
        "username": f"test_user_{timestamp}",
        "email": f"test_{timestamp}@example.com",
        "password": "TestPassword123!",
        "full_name": "Test User Verification"
    }
    
    print(f"📝 Tentative d'inscription avec:")
    print(f"   Username: {test_data['username']}")
    print(f"   Email: {test_data['email']}")
    print()
    
    try:
        # Appel API d'inscription
        response = requests.post(
            f"{API_URL}/auth/register",
            data=test_data
        )
        
        print(f"📡 Réponse du serveur: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ INSCRIPTION RÉUSSIE!")
            data = response.json()
            print(f"   Token reçu: {data.get('access_token', 'N/A')[:20]}...")
            print()
            return test_data['username']
        else:
            print(f"❌ ÉCHEC: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur lors de l'inscription: {e}")
        return None

def verify_in_database(username):
    """Vérifie que l'utilisateur est bien dans la BD"""
    print("🔍 VÉRIFICATION DANS LA BASE DE DONNÉES")
    print("=" * 60)
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, username, email, full_name FROM users WHERE username = :username"),
                {"username": username}
            )
            user = result.fetchone()
            
            if user:
                print("✅ UTILISATEUR TROUVÉ DANS LA BD!")
                print(f"   ID: {user[0]}")
                print(f"   Username: {user[1]}")
                print(f"   Email: {user[2]}")
                print(f"   Nom: {user[3]}")
                return True
            else:
                print("❌ Utilisateur NON trouvé dans la BD")
                return False
                
    except Exception as e:
        print(f"❌ Erreur BD: {e}")
        return False

def list_all_users():
    """Liste tous les utilisateurs"""
    print("\n📊 LISTE DE TOUS LES UTILISATEURS")
    print("=" * 60)
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10")
            )
            users = result.fetchall()
            
            if users:
                print(f"Total: {len(users)} utilisateurs (10 derniers)")
                print()
                for user in users:
                    print(f"  • {user[1]} ({user[2]}) - Créé: {user[3]}")
            else:
                print("⚠️  Aucun utilisateur dans la BD")
                
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 TEST COMPLET: INSCRIPTION + VÉRIFICATION BD")
    print("=" * 60 + "\n")
    
    # Test 1: Inscription
    username = test_registration()
    
    if username:
        print()
        # Test 2: Vérification dans la BD
        verify_in_database(username)
    
    # Bonus: Liste tous les utilisateurs
    list_all_users()
    
    print("\n" + "=" * 60)
    print("✅ TEST TERMINÉ")
    print("=" * 60)

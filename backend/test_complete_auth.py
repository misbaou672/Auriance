"""Test complet : Inscription + Connexion + Vérification BD"""
import requests
import time
from sqlalchemy import create_engine, text

API_URL = "http://localhost:8000"
DATABASE_URL = "postgresql://postgres:110603@localhost:5432/auriance_medical"

def main():
    print("\n" + "=" * 70)
    print("🚀 TEST COMPLET D'AUTHENTIFICATION")
    print("=" * 70 + "\n")
    
    # Données de test avec timestamp unique
    timestamp = int(time.time())
    test_user = {
        "username": f"final_test_{timestamp}",
        "email": f"final_{timestamp}@test.com",
        "password": "TestPass123!",
        "full_name": "Final Test User"
    }
    
    # ÉTAPE 1 : INSCRIPTION
    print("📝 ÉTAPE 1 : INSCRIPTION")
    print("-" * 70)
    print(f"Username: {test_user['username']}")
    print(f"Email: {test_user['email']}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/register",
            data=test_user,
            timeout=5
        )
        
        if response.status_code == 201:
            print("✅ INSCRIPTION RÉUSSIE!")
            data = response.json()
            print(f"   Token reçu: {data.get('access_token', 'N/A')[:30]}...")
        else:
            print(f"❌ ÉCHEC: {response.status_code}")
            print(f"   Détail: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion au serveur: {e}")
        print("💡 Vérifiez que le backend tourne sur http://localhost:8000")
        return False
    
    print()
    
    # ÉTAPE 2 : VÉRIFICATION DANS LA BD
    print("🔍 ÉTAPE 2 : VÉRIFICATION DANS LA BASE DE DONNÉES")
    print("-" * 70)
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, username, email, full_name FROM users WHERE username = :username"),
                {"username": test_user['username']}
            )
            user = result.fetchone()
            
            if user:
                print("✅ UTILISATEUR TROUVÉ DANS LA BD!")
                print(f"   ID: {user[0]}")
                print(f"   Username: {user[1]}")
                print(f"   Email: {user[2]}")
                print(f"   Nom: {user[3]}")
            else:
                print("❌ Utilisateur NON trouvé dans la BD")
                return False
                
    except Exception as e:
        print(f"❌ Erreur BD: {e}")
        return False
    
    print()
    
    # ÉTAPE 3 : CONNEXION
    print("🔐 ÉTAPE 3 : CONNEXION (LOGIN)")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            data={
                "username": test_user['username'],
                "password": test_user['password']
            },
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ CONNEXION RÉUSSIE!")
            data = response.json()
            token = data.get('access_token', '')
            print(f"   Token: {token[:30]}...")
            print(f"   Type: {data.get('token_type', 'N/A')}")
        else:
            print(f"❌ ÉCHEC: {response.status_code}")
            print(f"   Détail: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        return False
    
    print()
    
    # ÉTAPE 4 : STATISTIQUES
    print("📊 ÉTAPE 4 : STATISTIQUES")
    print("-" * 70)
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = result.fetchone()[0]
            print(f"Total d'utilisateurs dans la BD: {count}")
            
            result = conn.execute(
                text("SELECT username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5")
            )
            users = result.fetchall()
            print("\n5 derniers utilisateurs créés:")
            for user in users:
                print(f"  • {user[0]} ({user[1]}) - {user[2]}")
                
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    print()
    print("=" * 70)
    print("✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

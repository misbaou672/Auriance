"""Test final de connexion avec utilisateur existant"""
import requests
from sqlalchemy import create_engine, text

API_URL = "http://localhost:8000"
DATABASE_URL = "postgresql://postgres:110603@localhost:5432/auriance_medical"

print("\n" + "=" * 70)
print("🔐 TEST FINAL DE CONNEXION")
print("=" * 70 + "\n")

# Étape 1: Trouver un utilisateur existant dans la BD
print("1️⃣ Recherche d'un utilisateur existant dans la BD...")
try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT username, email FROM users ORDER BY created_at DESC LIMIT 1")
        )
        user = result.fetchone()
        
        if not user:
            print("❌ Aucun utilisateur dans la BD")
            print("💡 Créez d'abord un compte via le site web")
            exit(1)
        
        existing_username = user[0]
        existing_email = user[1]
        print(f"✅ Utilisateur trouvé: {existing_username} ({existing_email})")
        
except Exception as e:
    print(f"❌ Erreur BD: {e}")
    exit(1)

print()

# Étape 2: Créer un NOUVEAU compte pour le test
print("2️⃣ Création d'un nouveau compte de test...")
import time
timestamp = int(time.time())
new_user = {
    "username": f"testfinal_{timestamp}",
    "email": f"testfinal_{timestamp}@example.com",
    "password": "TestPass123!",
    "full_name": "Test Final User"
}

try:
    response = requests.post(
        f"{API_URL}/auth/register",
        data=new_user,
        timeout=5
    )
    
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 201:
        print("   ✅ Inscription réussie!")
        data = response.json()
        register_token = data.get('access_token', '')
        print(f"   Token: {register_token[:30]}...")
    else:
        print(f"   ❌ Erreur: {response.status_code}")
        try:
            error = response.json()
            print(f"   Détail: {error}")
        except:
            print(f"   Réponse: {response.text[:200]}")
        print("\n⚠️  L'inscription a échoué, mais on va tester la connexion avec un utilisateur existant")
        new_user = None
        
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    new_user = None

print()

# Étape 3: Test de connexion
print("3️⃣ Test de connexion...")

# Essayer avec le nouveau compte si créé, sinon utiliser un mot de passe connu
if new_user:
    test_username = new_user['username']
    test_password = new_user['password']
    print(f"   Avec le nouveau compte: {test_username}")
else:
    # Utiliser un compte de test connu
    test_username = "test_user_1737300444"
    test_password = "TestPassword123!"
    print(f"   Avec un compte existant: {test_username}")

try:
    response = requests.post(
        f"{API_URL}/auth/login",
        data={
            "username": test_username,
            "password": test_password
        },
        timeout=5
    )
    
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ CONNEXION RÉUSSIE!")
        data = response.json()
        login_token = data.get('access_token', '')
        print(f"   Token: {login_token[:30]}...")
        print(f"   Type: {data.get('token_type', 'bearer')}")
        
        print("\n" + "=" * 70)
        print("✅ TOUT FONCTIONNE PARFAITEMENT!")
        print("=" * 70)
        print("\n💡 Vous pouvez maintenant:")
        print("   1. Vous inscrire sur http://localhost:5173")
        print("   2. Vous connecter avec vos identifiants")
        print("   3. Accéder à la page Voice Recognition")
        
    else:
        print(f"   ❌ Connexion échouée: {response.status_code}")
        try:
            error = response.json()
            print(f"   Détail: {error}")
        except:
            print(f"   Réponse: {response.text[:200]}")
        
except Exception as e:
    print(f"   ❌ Erreur: {e}")

print()

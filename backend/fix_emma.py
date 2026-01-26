
import sys
import os

# Ajout du chemin pour importer les modules de l'application
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.crud import get_user_by_username, create_user
from app.services.auth_service import get_password_hash
from app.schemas import UserCreate
from app.models.user import User

def fix_emma_account():
    db = SessionLocal()
    try:
        username = "emma_moreau"
        password = "password123" # Simple default password for testing
        
        user = get_user_by_username(db, username)
        
        if user:
            print(f"User '{username}' found.")
            # Reset password
            user.hashed_password = get_password_hash(password)
            db.commit()
            print(f"Password for '{username}' has been reset to '{password}'.")
        else:
            print(f"User '{username}' NOT found. Creating it...")
            user_in = UserCreate(
                username=username,
                email="emma.moreau@example.com",
                password=password,
                full_name="Emma Moreau"
            )
            create_user(db, user_in)
            print(f"User '{username}' created with password '{password}'.")
            
        # List all users
        print("\nAll users in database:")
        users = db.query(User).all()
        for u in users:
            print(f"- {u.username} ({u.email})")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_emma_account()

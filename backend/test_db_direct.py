"""Test direct database insert"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User
from app.services.auth_service import get_password_hash
import time

print("=" * 60)
print("TEST DIRECT DATABASE INSERT")
print("=" * 60)

db = SessionLocal()

try:
    # Create test user
    ts = int(time.time())
    test_user = User(
        username=f"dbtest{ts}",
        email=f"dbtest{ts}@test.com",
        hashed_password=get_password_hash("Pass123!"),
        full_name="DB Test User"
    )
    
    print(f"\n[1] Creating user: {test_user.username}")
    
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    print(f"SUCCESS - User created with ID: {test_user.id}")
    print(f"Username: {test_user.username}")
    print(f"Email: {test_user.email}")
    
    # Verify it's in DB
    from sqlalchemy import text
    result = db.execute(
        text("SELECT id, username, email FROM users WHERE username = :username"),
        {"username": test_user.username}
    )
    user = result.fetchone()
    
    if user:
        print(f"\n[2] Verification: User found in DB")
        print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}")
    
    print("\n" + "=" * 60)
    print("DIRECT DB INSERT WORKS!")
    print("=" * 60)
    print("\nConclusion: Le probleme est dans l'API, pas dans le modele")
    
except Exception as e:
    print(f"\nERROR: {e}")
    print(f"Type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
    
finally:
    db.close()

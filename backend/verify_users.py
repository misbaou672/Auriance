import sys
import os

# Add the current directory to sys.path to make 'app' module importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.db.session import SessionLocal
    from app.models.user import User
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def list_users():
    print("--- Connecting to Database ---")
    try:
        db = SessionLocal()
        print("--- Connected ---")
        users = db.query(User).all()
        print(f"Total Users Found: {len(users)}")
        print("-" * 30)
        for user in users:
            print(f"ID: {user.id} | Username: {user.username} | Email: {user.email} | Name: {user.full_name}")
        print("-" * 30)
    except Exception as e:
        print(f"Database Error: {e}")
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    list_users()

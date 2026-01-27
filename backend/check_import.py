
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Attempting to import app.main_auriance...")
try:
    from app.main_auriance import app
    print("Success: app imported.")
except Exception as e:
    print(f"Error importing app: {e}")
    import traceback
    traceback.print_exc()

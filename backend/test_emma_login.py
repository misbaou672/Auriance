
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    print(f"Testing login for 'emma_moreau' at {BASE_URL}...")
    
    url = f"{BASE_URL}/auth/login"
    payload = {
        "username": "emma_moreau",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, data=payload)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print("Login SUCCESS!")
            print(f"Token received: {token_data['access_token'][:20]}...")
            return True
        else:
            print("Login FAILED!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error connecting to backend: {e}")
        return False

if __name__ == "__main__":
    test_login()

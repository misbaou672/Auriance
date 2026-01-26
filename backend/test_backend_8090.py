import requests
import time

API_URL = "http://localhost:8090"
USERNAME = f"user_{int(time.time())}"
PASSWORD = "Password123!"
EMAIL = f"{USERNAME}@example.com"

print(f"Testing Backend at {API_URL}")

# 1. Health verify
try:
    r = requests.get(f"{API_URL}/health")
    print(f"Health Check: {r.status_code} {r.json() if r.status_code == 200 else r.text}")
except Exception as e:
    print(f"Health Check Failed: {e}")
    exit(1)

# 2. Register
print(f"Registering {USERNAME}...")
r = requests.post(f"{API_URL}/auth/register", data={
    "username": USERNAME,
    "password": PASSWORD,
    "email": EMAIL,
    "full_name": "Test User"
})
if r.status_code == 200:
    print("Registration Success!")
else:
    print(f"Registration Failed: {r.status_code} {r.text}")
    # If failed, maybe user exists (unlikely with timestamp) or DB issue.

# 3. Login
print(f"Logging in {USERNAME}...")
r = requests.post(f"{API_URL}/auth/login", data={
    "username": USERNAME,
    "password": PASSWORD
})
if r.status_code == 200:
    print("Login Success!")
    token = r.json().get("access_token")
    print(f"Token received: {token[:20]}...")
else:
    print(f"Login Failed: {r.status_code} {r.text}")

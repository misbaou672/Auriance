import socket
import os
import re
from pathlib import Path

def get_ip_address():
    try:
        # Connect to a public DNS server to determine the most appropriate local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def update_mobile_env(ip_address):
    # Define paths
    project_root = Path(__file__).parent
    mobile_env_path = project_root / "auriance_mobile" / ".env"
    
    if not mobile_env_path.exists():
        print(f"❌ Error: Could not find {mobile_env_path}")
        # Try to copy from example if exists
        example_path = project_root / "auriance_mobile" / ".env.example"
        if example_path.exists():
            print(f"⚠️ Creating .env from .env.example...")
            content = example_path.read_text(encoding='utf-8')
        else:
            return False
    else:
        content = mobile_env_path.read_text(encoding='utf-8')
    
    # New Base URL
    new_base_url = f"http://{ip_address}:8000"
    
    # Regex to find and replace API_BASE_URL
    # Handles API_BASE_URL=http://... or just API_BASE_URL=
    pattern = r"^API_BASE_URL=.*$"
    replacement = f"API_BASE_URL={new_base_url}"
    
    if re.search(pattern, content, flags=re.MULTILINE):
        new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    else:
        # Append if not found
        new_content = content + f"\n{replacement}"
        
    mobile_env_path.write_text(new_content, encoding='utf-8')
    print(f"✅ Updated API_BASE_URL to: {new_base_url}")
    return True

def main():
    print("🔄 Détection de la configuration réseau...")
    ip = get_ip_address()
    print(f"📍 Adresse IP locale détectée: {ip}")
    
    print("\n📝 Mise à jour de la configuration mobile...")
    if update_mobile_env(ip):
        print("\n✨ Configuration terminée ! Vous pouvez lancer l'application.")
        print("💡 Assurez-vous que votre téléphone est sur le même WiFi que cet ordinateur.")
    else:
        print("\n❌ Échec de la configuration.")

if __name__ == "__main__":
    main()

"""
Script de diagnostic pour tester la connexion mobile -> backend
"""
import requests
import json
from pathlib import Path

def test_backend_accessible():
    """Test si le backend répond"""
    print("=" * 60)
    print("TEST CONNEXION BACKEND")
    print("=" * 60)
    
    urls_to_test = [
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://10.0.2.2:8000",  # Émulateur Android
    ]
    
    print("\n🔍 Test de connexion...")
    
    for url in urls_to_test:
        try:
            response = requests.get(f"{url}/docs", timeout=2)
            if response.status_code == 200:
                print(f"✅ {url} - ACCESSIBLE")
                return url
            else:
                print(f"⚠️  {url} - Code {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {url} - CONNEXION REFUSÉE")
        except requests.exceptions.Timeout:
            print(f"❌ {url} - TIMEOUT")
        except Exception as e:
            print(f"❌ {url} - Erreur: {e}")
    
    print("\n❌ Aucune URL accessible")
    return None

def test_transcription_endpoint(base_url):
    """Test l'endpoint de transcription"""
    print("\n" + "=" * 60)
    print("TEST ENDPOINT TRANSCRIPTION")
    print("=" * 60)
    
    # Créer un fichier audio de test minimal (silence)
    import wave
    import struct
    
    test_file = Path("test_audio.wav")
    
    # Générer 1 seconde de silence
    sample_rate = 16000
    duration = 1  # seconde
    num_samples = sample_rate * duration
    
    with wave.open(str(test_file), 'w') as wav_file:
        wav_file.setnchannels(1)  # mono
        wav_file.setsampwidth(2)  # 16 bits
        wav_file.setframerate(sample_rate)
        
        # Écrire des samples de silence
        for _ in range(num_samples):
            wav_file.writeframes(struct.pack('<h', 0))
    
    print(f"\n📁 Fichier test créé: {test_file}")
    
    # Tester l'endpoint
    try:
        with open(test_file, 'rb') as f:
            files = {'audio_file': ('test.wav', f, 'audio/wav')}
            data = {'language': 'fr'}
            
            print(f"📤 Envoi vers {base_url}/api/auriance/transcribe...")
            response = requests.post(
                f"{base_url}/api/auriance/transcribe",
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("\n✅ SUCCÈS !")
                print(f"📝 Transcription: {result.get('transcription', 'N/A')}")
                print(f"🌍 Langue: {result.get('language', 'N/A')}")
                print(f"📊 Confiance: {result.get('confidence', 'N/A')}")
                return True
            else:
                print(f"\n❌ Erreur {response.status_code}")
                print(f"Réponse: {response.text}")
                return False
                
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        return False
    finally:
        # Nettoyer
        if test_file.exists():
            test_file.unlink()
            print(f"\n🗑️  Fichier test supprimé")

def check_ip_address():
    """Affiche l'IP locale pour configurer le mobile"""
    import socket
    
    print("\n" + "=" * 60)
    print("CONFIGURATION IP POUR MOBILE")
    print("=" * 60)
    
    try:
        # Obtenir l'IP locale
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        
        print(f"\n📍 Votre IP locale: {local_ip}")
        print(f"\n⚙️  Configuration mobile:")
        print(f"   Fichier: auriance_mobile/.env")
        print(f"   Ligne: API_BASE_URL=http://{local_ip}:8000")
        print(f"\n   OU si ADB reverse est actif:")
        print(f"   Ligne: API_BASE_URL=http://127.0.0.1:8000")
        
    except Exception as e:
        print(f"❌ Impossible de déterminer l'IP: {e}")

def main():
    """Test complet"""
    print("\n" + "🔧 DIAGNOSTIC DE CONNEXION AURIANCE 🔧".center(60))
    print()
    
    # Step 1: Tester la connexion
    base_url = test_backend_accessible()
    
    if not base_url:
        print("\n⚠️  Le backend n'est pas accessible!")
        print("   Assurez-vous que le serveur tourne:")
        print("   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")
        return False
    
    # Step 2: Tester l'endpoint transcription
    success = test_transcription_endpoint(base_url)
    
    # Step 3: Afficher la config IP
    check_ip_address()
    
    # Résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ")
    print("=" * 60)
    
    if success:
        print("\n✅ Backend fonctionnel !")
        print("\n📱 Pour le mobile:")
        print("   1. Vérifiez l'IP dans .env")
        print("   2. OU activez adb reverse:")
        print("      adb reverse tcp:8000 tcp:8000")
        print("   3. Relancez l'app mobile")
    else:
        print("\n❌ Problème avec le backend")
        print("   Vérifiez les logs du serveur")
    
    return success

if __name__ == "__main__":
    import sys
    result = main()
    sys.exit(0 if result else 1)

# backend/test_whisper_demo.py
import os
import time
import requests


def test_whisper_server():
    """Test complet du serveur Whisper (Flask app/app.py)."""

    base_url = os.getenv("WHISPER_URL", "http://localhost:5000")
    health_url = f"{base_url}/api/health"
    transcribe_url = f"{base_url}/api/transcribe"
    languages_url = f"{base_url}/api/languages"

    print("🧪 TEST COMPLET SERVEUR WHISPER")
    print("=" * 50)

    # 1. Test santé
    try:
        print("1. 🩺 Test santé du serveur...")
        response = requests.get(health_url, timeout=10)
        response.raise_for_status()
        health_data = response.json()
        print("✅ Serveur OK")
        print("   Modèle:", health_data.get("whisper_model", "N/A"))
        print("   Device:", health_data.get("device", "N/A"))
        print("   DB:", health_data.get("database", "N/A"))
    except Exception as e:
        print("❌ Serveur inaccessible:", e)
        return

    # 2. Langues supportées
    print("\n2. 🌍 Langues supportées...")
    try:
        response = requests.get(languages_url, timeout=10)
        response.raise_for_status()
        langs = response.json().get("languages", [])
        codes = [l.get("code", "?") for l in langs]
        print(f"✅ {len(codes)} langues: {', '.join(codes)}")
    except Exception as e:
        print("❌ Impossible de récupérer les langues:", e)

    # 3. Test page racine
    print("\n3. 🔗 Test page d'accueil...")
    try:
        r = requests.get(base_url, timeout=10)
        print(f"✅ / status={r.status_code}")
    except Exception as e:
        print("❌ / inaccessible:", e)

    # 4. Test transcription si fichier audio existe
    print("\n4. 🎤 Test transcription audio...")
    audio_files = [
        f for f in os.listdir('.') if f.lower().endswith(('.wav', '.mp3', '.m4a'))
    ]

    if audio_files:
        test_file = audio_files[0]
        print(f"   Fichier trouvé: {test_file}")

        try:
            with open(test_file, 'rb') as f:
                files = {'audio': (test_file, f, 'audio/wav')}
                start = time.time()
                response = requests.post(transcribe_url, files=files, timeout=120)

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print("✅ Transcription réussie!")
                    print(f"   Texte: {result.get('text', 'N/A')}")
                    print(f"   Langue: {result.get('detected_language', 'N/A')}")
                    print(f"   Durée: {result.get('processing_time', 'N/A')}s")
                else:
                    print("❌ Erreur transcription:", result.get('error', 'Unknown'))
            else:
                print(f"❌ Erreur HTTP: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"❌ Erreur fichier/transcription: {e}")
    else:
        print("ℹ️  Aucun fichier audio trouvé pour le test")
        print("   Créez un fichier test.wav dans le dossier backend")

    print("\n🎯 POUR LA DÉMO:")
    print(f"   • Ouvrez: {base_url}")
    print(f"   • Santé: curl {health_url}")
    print(f"   • Langues: curl {languages_url}")
    print(f"   • Transcription: curl -X POST -F \"audio=@test.wav\" {transcribe_url}")


if __name__ == "__main__":
    test_whisper_server()
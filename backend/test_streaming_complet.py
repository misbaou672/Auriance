import socketio
import sounddevice as sd
import numpy as np
import base64
import time
import threading

print("🎤 TEST STREAMING COMPLET")
print("=" * 50)

# Configuration audio
SAMPLE_RATE = 16000
CHUNK_DURATION = 0.5  # 500ms par chunk
CHUNK_SIZE = int(SAMPLE_RATE * CHUNK_DURATION)

# Client WebSocket
sio = socketio.Client()

streaming_active = False
received_data = []

@sio.event
def connect():
    global streaming_active
    print("✅ Connecté au serveur WebSocket")
    streaming_active = True

@sio.event
def connect_error(data):
    print(f"❌ Erreur connexion: {data}")

@sio.event
def stream_update(data):
    print(f"📥 Réception: {data.get('type', 'unknown')}")
    if data.get('type') == 'transcription' and data.get('text'):
        text = data['text'].strip()
        if text:
            print(f"   🎤 Texte: {text}")
            received_data.append(text)

@sio.event
def connected(data):
    print(f"🔌 Session: {data.get('session_id', 'unknown')}")

@sio.event
def disconnect():
    global streaming_active
    print("🔌 Déconnecté")
    streaming_active = False

def record_and_stream():
    """Enregistre et envoie en streaming"""
    print("🎙️ Démarrage enregistrement (parlez maintenant)...")
    
    try:
        def audio_callback(indata, frames, time_info, status):
            if status:
                print(f"⚠️ Audio status: {status}")
            
            if streaming_active:
                # Convertir en int16 et encoder en base64
                audio_chunk = (indata * 32767).astype(np.int16).tobytes()
                audio_b64 = base64.b64encode(audio_chunk).decode('utf-8')
                
                # Envoyer au serveur
                sio.emit('audio_stream', {'audio': audio_b64})
        
        # Démarrer l'enregistrement
        with sd.InputStream(samplerate=SAMPLE_RATE,
                          channels=1,
                          callback=audio_callback,
                          blocksize=CHUNK_SIZE,
                          dtype='float32'):
            
            print("⏺️ Enregistrement en cours... Parlez pendant 5 secondes")
            time.sleep(5)  # Enregistrer pendant 5 secondes
            print("⏹️ Enregistrement terminé")
            
    except Exception as e:
        print(f"❌ Erreur enregistrement: {e}")

# Connexion
try:
    print("🔌 Connexion au serveur...")
    sio.connect('http://127.0.0.1:5000', wait_timeout=5)
    
    # Démarrer l'enregistrement
    record_thread = threading.Thread(target=record_and_stream)
    record_thread.start()
    record_thread.join()
    
    # Attendre les réponses
    time.sleep(2)
    
    # Résumé
    print("\\n📊 RÉSUMÉ DU TEST:")
    print("=" * 30)
    if received_data:
        full_text = ' '.join(received_data)
        print(f"✅ Transcription reçue: {full_text}")
        print(f"📝 Nombre de chunks: {len(received_data)}")
    else:
        print("❌ Aucune donnée reçue")
    
    # Déconnexion
    sio.disconnect()
    
except Exception as e:
    print(f"💥 Erreur: {e}")
finally:
    print("✅ Test terminé")

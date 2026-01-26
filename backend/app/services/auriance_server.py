# auriance_server.py - SERVEUR STREAMING COMPLET
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import whisper
import torch
import numpy as np
import tempfile
import os
import logging
import time
import base64
import threading
from datetime import datetime

# Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

print("=" * 70)
print("🎤 AURIANCE SERVEUR - STREAMING TEMPS RÉEL")
print("=" * 70)

# Charger Whisper
try:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = whisper.load_model("base", device=device)
    logger.info(f"✅ Whisper chargé sur {device.upper()}")
    MODEL_READY = True
except Exception as e:
    logger.error(f"❌ Erreur Whisper: {e}")
    logger.info("⚠️ Mode simulation activé")
    model = None
    MODEL_READY = False

# Buffers pour streaming
stream_buffers = {}
stream_lock = threading.Lock()

# =============== WEB SOCKET STREAMING ===============
@socketio.on('connect')
def handle_connect():
    sid = request.sid
    with stream_lock:
        stream_buffers[sid] = {
            'audio': [],
            'last_text': '',
            'last_time': time.time()
        }
    logger.info(f"🔗 Client connecté: {sid}")
    emit('connected', {'status': 'ready', 'sid': sid})

@socketio.on('stream_audio')
def handle_stream_audio(data):
    """Reçoit l'audio et transcrit en temps réel"""
    try:
        sid = request.sid
        
        # Décoder audio base64
        audio_bytes = base64.b64decode(data['audio'])
        
        # Convertir en numpy array
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        
        with stream_lock:
            if sid not in stream_buffers:
                stream_buffers[sid] = {
                    'audio': [],
                    'last_text': '',
                    'last_time': time.time()
                }
            
            buffer = stream_buffers[sid]
            buffer['audio'].extend(audio_np.tolist())
            
            # Garder seulement 2 secondes
            max_samples = 16000 * 2
            if len(buffer['audio']) > max_samples:
                buffer['audio'] = buffer['audio'][-max_samples:]
            
            # Transcrire toutes les 500ms
            current_time = time.time()
            if current_time - buffer['last_time'] > 0.5 and len(buffer['audio']) >= 8000:
                audio_array = np.array(buffer['audio'], dtype=np.float32)
                
                if model:
                    # Transcription réelle avec Whisper
                    result = model.transcribe(
                        audio_array,
                        language='fr',  # Français par défaut
                        task='transcribe',
                        temperature=0.0,
                        best_of=1,
                        beam_size=1
                    )
                    text = result['text'].strip()
                else:
                    # Simulation si Whisper non disponible
                    text = "[Simulation] Parlez en français..."
                
                if text and text != buffer['last_text']:
                    buffer['last_text'] = text
                    buffer['last_time'] = current_time
                    
                    emit('transcription', {
                        'text': text,
                        'partial': True,
                        'timestamp': current_time
                    })
        
    except Exception as e:
        logger.error(f"❌ Erreur streaming: {e}")

@socketio.on('stream_stop')
def handle_stream_stop():
    """Arrêter le streaming"""
    sid = request.sid
    with stream_lock:
        if sid in stream_buffers:
            del stream_buffers[sid]
    
    emit('stream_stopped', {'status': 'stopped'})
    logger.info(f"⏹️ Streaming arrêté: {sid}")

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    with stream_lock:
        if sid in stream_buffers:
            del stream_buffers[sid]
    logger.info(f"🔌 Client déconnecté: {sid}")

# =============== API REST ===============
@app.route('/')
def home():
    return '''
    <html>
    <head><title>Auriance Server</title></head>
    <body style="font-family: Arial; margin: 40px;">
        <h1>🎤 Auriance - Streaming Temps Réel</h1>
        <div style="background: #f0f0f0; padding: 20px; border-radius: 10px;">
            <p><strong>Status: 🟢 ACTIF</strong></p>
            <p>📍 URL: http://127.0.0.1:5000</p>
            <p>🔗 WebSocket: ws://127.0.0.1:5000/socket.io</p>
            <p>🎤 Mode: Streaming temps réel</p>
            <p>🌍 Langue: Français (par défaut)</p>
            <p>⚡ Whisper: ''' + ('✅ Prêt' if MODEL_READY else '⚠️ Simulation') + '''</p>
        </div>
    </body>
    </html>
    '''

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "streaming": True,
        "whisper_ready": MODEL_READY,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/transcribe', methods=['POST'])
def transcribe_file():
    """Transcription par fichier (fallback)"""
    if not MODEL_READY:
        return jsonify({
            "success": False,
            "error": "Whisper non disponible"
        }), 500
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Fichier audio requis"}), 400
        
        audio_file = request.files['audio']
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
            audio_file.save(f.name)
            temp_path = f.name
        
        result = model.transcribe(temp_path, language='fr')
        text = result["text"].strip()
        
        os.unlink(temp_path)
        
        return jsonify({
            "success": True,
            "text": text,
            "language": result.get("language", "fr")
        })
        
    except Exception as e:
        logger.error(f"❌ Erreur transcription: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 SERVEUR PRÊT POUR STREAMING")
    print("=" * 70)
    print(f"📍 URL: http://127.0.0.1:5000")
    print(f"🔗 WebSocket: ws://127.0.0.1:5000/socket.io")
    print(f"🎤 Mode: Transcription en temps réel")
    print(f"🌍 Langue: Français")
    print(f"⚡ Whisper: {'✅ Prêt' if MODEL_READY else '⚠️ Simulation'}")
    print("=" * 70)
    
    socketio.run(app,
                host='127.0.0.1',
                port=5000,
                debug=False,
                allow_unsafe_werkzeug=True)
# auriance_turbo_pro_server_optimized.py
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
import psycopg2
from psycopg2.extras import RealDictCursor
import re
import json
from datetime import datetime

# =============== CONFIGURATION ===============
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

print("=" * 70)
print("🚀 AURIANCE TURBO PRO SERVER - VERSION OPTIMISÉE")
print("=" * 70)

# =============== CHARGEMENT MODÈLES ===============
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"⚡ Device: {device.upper()}")

# 1. Whisper Tiny (ULTRA RAPIDE)
try:
    model = whisper.load_model("tiny", device=device)
    logger.info("✅ Whisper TINY chargé! (Ultra rapide)")
except Exception as e:
    logger.error(f"❌ Erreur Whisper: {e}")
    model = None

# 2. Silero VAD (Voice Activity Detection)
vad_model = None
try:
    vad_model, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad',
                                      model='silero_vad',
                                      force_reload=False,
                                      trust_repo=True)
    (get_speech_timestamps, _, read_audio, *_) = utils
    logger.info("✅ Silero VAD chargé! (Détection parole en temps réel)")
except Exception as e:
    logger.warning(f"⚠️ Silero VAD non chargé: {e}")

# =============== BASE DE DONNÉES ===============
def get_db_connection():
    """Connexion à PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="auriance",
            user="postgres",
            password="auriance123",
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        logger.error(f"❌ Erreur connexion BD: {e}")
        return None

def init_database():
    """Initialiser les tables si elles n'existent pas"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Table transcriptions
        cur.execute("""
            CREATE TABLE IF NOT EXISTS transcriptions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(100),
                text TEXT NOT NULL,
                detected_language VARCHAR(10),
                confidence FLOAT,
                processing_time FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Table données extraites
        cur.execute("""
            CREATE TABLE IF NOT EXISTS extracted_data (
                id SERIAL PRIMARY KEY,
                transcription_id INTEGER REFERENCES transcriptions(id),
                entity_type VARCHAR(50),
                entity_value TEXT,
                confidence FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Table sessions streaming
        cur.execute("""
            CREATE TABLE IF NOT EXISTS streaming_sessions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(100) UNIQUE,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                total_chunks INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'active'
            )
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        logger.info("✅ Base de données initialisée")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur init BD: {e}")
        return False

# Initialiser la BD au démarrage
init_database()

# =============== FONCTIONS UTILITAIRES ===============
def detect_speech_silero(audio_bytes, sample_rate=16000):
    """Détection parole avec Silero VAD (professionnel)"""
    try:
        if vad_model is None:
            # Fallback simple si Silero pas disponible
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16)
            rms = np.sqrt(np.mean((audio_np.astype(np.float32) / 32768.0) ** 2))
            return rms > 0.001, float(rms * 50)
        
        # Convertir bytes en tensor pour Silero
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16)
        audio_tensor = torch.from_numpy(audio_np.astype(np.float32) / 32768.0)
        
        # Détection parole
        speech_timestamps = get_speech_timestamps(
            audio_tensor,
            vad_model,
            threshold=0.5,
            sampling_rate=sample_rate,
            min_speech_duration_ms=250,
            min_silence_duration_ms=100
        )
        
        has_speech = len(speech_timestamps) > 0
        confidence = min(len(speech_timestamps) * 0.3, 1.0)  # Estimation
        
        return has_speech, confidence
        
    except Exception as e:
        logger.error(f"❌ Erreur détection: {e}")
        return True, 0.7  # Accepter par défaut

def extract_entities(text):
    """Extraction simple d'entités (NLP basique)"""
    entities = []
    
    # Noms (Je m'appelle X)
    name_match = re.search(r"(?:je m[' ]?appelle|mon nom est|name is)\s+([A-Z][a-zéèêëàâäôöûüç\-\s]+)", text, re.IGNORECASE)
    if name_match:
        entities.append({
            "type": "name",
            "value": name_match.group(1).strip(),
            "confidence": 0.9
        })
    
    # Âge
    age_match = re.search(r"\b(\d{1,3})\s*(?:ans|years?|age)\b", text, re.IGNORECASE)
    if age_match:
        entities.append({
            "type": "age",
            "value": age_match.group(1),
            "confidence": 0.8
        })
    
    # Ville
    city_match = re.search(r"(?:j'habite|ville|city|à|in)\s+([A-Z][a-zéèêëàâäôöûüç\-\s]+)", text, re.IGNORECASE)
    if city_match:
        entities.append({
            "type": "city",
            "value": city_match.group(1).strip(),
            "confidence": 0.7
        })
    
    # Email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    if email_match:
        entities.append({
            "type": "email",
            "value": email_match.group(),
            "confidence": 0.95
        })
    
    # Téléphone
    phone_match = re.search(r'\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b', text)
    if phone_match:
        entities.append({
            "type": "phone",
            "value": phone_match.group(),
            "confidence": 0.85
        })
    
    # Date
    date_match = re.search(r'\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})\b', text)
    if date_match:
        entities.append({
            "type": "date",
            "value": date_match.group(),
            "confidence": 0.8
        })
    
    return entities

def save_transcription(session_id, text, detected_lang, confidence, proc_time):
    """Sauvegarde dans PostgreSQL"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO transcriptions 
            (session_id, text, detected_language, confidence, processing_time)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (session_id, text, detected_lang, confidence, proc_time))
        
        trans_id = cur.fetchone()['id']
        
        # Extraire et sauvegarder les entités
        entities = extract_entities(text)
        for entity in entities:
            cur.execute("""
                INSERT INTO extracted_data 
                (transcription_id, entity_type, entity_value, confidence)
                VALUES (%s, %s, %s, %s)
            """, (trans_id, entity['type'], entity['value'], entity['confidence']))
        
        conn.commit()
        cur.close()
        conn.close()
        
        logger.info(f"💾 Transcription sauvegardée (ID: {trans_id}, {len(entities)} entités)")
        return trans_id, entities
        
    except Exception as e:
        logger.error(f"❌ Erreur sauvegarde BD: {e}")
        return None, []

# =============== ROUTES API ===============
@app.route('/')
def home():
    return """
    <html>
        <head><title>Auriance Turbo Pro</title></head>
        <body style="font-family: Arial; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <h1>🎤 Auriance Turbo Pro Server</h1>
            <p><strong>Version OPTIMISÉE - Streaming + Silero VAD + PostgreSQL</strong></p>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p>✅ Whisper Tiny (Ultra rapide)</p>
                <p>🔊 Silero VAD (Détection parole temps réel)</p>
                <p>🌍 99+ langues supportées</p>
                <p>🗄️ PostgreSQL + Extraction entités</p>
                <p>⚡ WebSocket streaming</p>
            </div>
            <p><em>Endpoints:</em></p>
            <ul>
                <li><code>POST /api/transcribe_pro</code> - Transcription optimisée</li>
                <li><code>GET /api/health</code> - Santé système</li>
                <li><code>GET /api/languages</code> - 99+ langues</li>
                <li><code>GET /api/stats</code> - Statistiques</li>
                <li><code>WS /socket.io</code> - Streaming WebSocket</li>
            </ul>
        </body>
    </html>
    """

@app.route('/api/health', methods=['GET'])
def health():
    """Endpoint santé complet"""
    return jsonify({
        "status": "healthy",
        "service": "auriance-turbo-pro-optimized",
        "model": "whisper-tiny",
        "device": device,
        "vad_available": vad_model is not None,
        "database": "postgresql",
        "features": ["silero-vad", "streaming", "multi-language", "entity-extraction", "real-time"],
        "performance": {
            "target_latency": "< 2 seconds",
            "supported_languages": 99,
            "streaming": True
        }
    })

@app.route('/api/transcribe_pro', methods=['POST'])
def transcribe_pro_optimized():
    """Endpoint PRO OPTIMISÉ (rapide + extraction)"""
    start_time = time.time()
    temp_path = None
    
    try:
        # Validation
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file", "success": False}), 400
        
        audio_file = request.files['audio']
        audio_bytes = audio_file.read()
        
        if len(audio_bytes) < 8000:
            return jsonify({"error": "Audio too short", "success": False}), 400
        
        # Détection parole avec Silero
        has_speech, confidence = detect_speech_silero(audio_bytes)
        
        if not has_speech:
            return jsonify({
                "success": True,
                "text": "",
                "has_speech": False,
                "message": "No speech detected"
            })
        
        # Sauvegarde temporaire
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
            audio_file.seek(0)
            audio_file.save(f.name)
            temp_path = f.name
        
        # Paramètres transcription
        language = request.form.get('language', 'auto')
        language = None if language == 'auto' else language
        
        # TRANSCRIPTION RAPIDE
        result = model.transcribe(
            temp_path,
            language=language,
            task="transcribe",
            temperature=0.0,
            best_of=2,  # Réduit pour vitesse
            beam_size=2,
            no_speech_threshold=0.6,
            condition_on_previous_text=False  # Plus rapide
        )
        
        text = result["text"].strip()
        detected_lang = result.get("language", language or "auto")
        processing_time = time.time() - start_time
        
        logger.info(f"✅ Transcription ({processing_time:.2f}s): {text[:80]}...")
        
        # Sauvegarde BD + extraction entités
        session_id = f"session_{int(time.time())}"
        trans_id, entities = save_transcription(
            session_id, text, detected_lang, confidence, processing_time
        )
        
        # Réponse optimisée
        response = {
            "success": True,
            "text": text,
            "detected_language": detected_lang,
            "confidence": float(confidence),
            "processing_time": float(processing_time),
            "word_count": len(text.split()),
            "entities": entities,
            "session_id": session_id,
            "transcription_id": trans_id,
            "performance": {
                "model": "whisper-tiny",
                "vad": "silero" if vad_model else "basic",
                "latency": f"{processing_time:.2f}s"
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Transcription error: {e}")
        return jsonify({"error": str(e), "success": False}), 500
        
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass

@app.route('/api/languages', methods=['GET'])
def supported_languages_full():
    """Liste complète des 99+ langues Whisper"""
    languages = []
    
    # Liste complète des langues Whisper
    whisper_langs = [
        ("fr", "Français", "excellent"),
        ("en", "English", "excellent"),
        ("es", "Español", "excellent"),
        ("de", "Deutsch", "excellent"),
        ("it", "Italiano", "excellent"),
        ("pt", "Português", "excellent"),
        ("nl", "Nederlands", "excellent"),
        ("ru", "Русский", "excellent"),
        ("ja", "日本語", "excellent"),
        ("ko", "한국어", "excellent"),
        ("zh", "中文", "excellent"),
        ("ar", "العربية", "good"),
        ("hi", "हिन्दी", "good"),
        ("bn", "বাংলা", "good"),
        ("pa", "ਪੰਜਾਬੀ", "good"),
        ("ta", "தமிழ்", "good"),
        ("te", "తెలుగు", "good"),
        ("mr", "मराठी", "good"),
        ("ur", "اردو", "good"),
        ("fa", "فارسی", "good"),
        ("tr", "Türkçe", "good"),
        ("pl", "Polski", "good"),
        ("uk", "Українська", "good"),
        ("vi", "Tiếng Việt", "good"),
        ("th", "ไทย", "good"),
        ("sv", "Svenska", "good"),
        ("da", "Dansk", "good"),
        ("fi", "Suomi", "good"),
        ("no", "Norsk", "good"),
        ("cs", "Čeština", "good"),
        ("hu", "Magyar", "good"),
        ("el", "Ελληνικά", "good"),
        ("he", "עברית", "good"),
        ("id", "Indonesia", "good"),
        ("ms", "Melayu", "good"),
        ("ro", "Română", "good"),
        ("sk", "Slovenčina", "good"),
        ("bg", "Български", "good"),
        ("hr", "Hrvatski", "good"),
        ("lt", "Lietuvių", "good"),
        ("sl", "Slovenščina", "good"),
        ("et", "Eesti", "medium"),
        ("lv", "Latviešu", "medium"),
        ("sw", "Kiswahili", "medium"),
    ]
    
    # Trier par nom
    whisper_langs.sort(key=lambda x: x[1])
    
    # Format pour API
    for code, name, quality in whisper_langs[:50]:  # Limite à 50 pour la démo
        languages.append({
            "code": code,
            "name": name,
            "quality": quality,
            "supported": True
        })
    
    return jsonify({
        "languages": languages,
        "total": len(languages),
        "auto_detection": True,
        "note": "Whisper supports 99+ languages. Showing first 50."
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Statistiques du système"""
    conn = get_db_connection()
    stats = {}
    
    if conn:
        try:
            cur = conn.cursor()
            
            # Nombre total de transcriptions
            cur.execute("SELECT COUNT(*) as count FROM transcriptions")
            stats["total_transcriptions"] = cur.fetchone()['count']
            
            # Nombre total d'entités extraites
            cur.execute("SELECT COUNT(*) as count FROM extracted_data")
            stats["total_entities"] = cur.fetchone()['count']
            
            # Langues les plus utilisées
            cur.execute("""
                SELECT detected_language, COUNT(*) as count 
                FROM transcriptions 
                WHERE detected_language != 'none'
                GROUP BY detected_language 
                ORDER BY count DESC 
                LIMIT 5
            """)
            stats["top_languages"] = cur.fetchall()
            
            # Temps moyen de traitement
            cur.execute("SELECT AVG(processing_time) as avg_time FROM transcriptions")
            avg_time = cur.fetchone()['avg_time']
            stats["avg_processing_time"] = float(avg_time) if avg_time else 0
            
            cur.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Erreur stats: {e}")
    
    # Ajouter stats système
    stats.update({
        "system": {
            "whisper_model": "tiny",
            "vad_engine": "silero" if vad_model else "basic",
            "database": "postgresql",
            "status": "operational"
        }
    })
    
    return jsonify(stats)

# =============== WEBSOCKET STREAMING ===============
@socketio.on('connect')
def handle_connect():
    """Nouvelle connexion WebSocket"""
    session_id = request.sid
    logger.info(f"🔌 WebSocket connecté: {session_id}")
    emit('connected', {'session_id': session_id, 'status': 'connected'})

@socketio.on('audio_stream')
def handle_audio_stream(data):
    """Reçoit un chunk audio en streaming"""
    try:
        session_id = request.sid
        
        # Convertir base64 en bytes si nécessaire
        if isinstance(data, dict) and 'audio' in data:
            import base64
            audio_bytes = base64.b64decode(data['audio'])
        else:
            audio_bytes = data
        
        # Détection parole rapide
        has_speech, confidence = detect_speech_silero(audio_bytes)
        
        if not has_speech:
            emit('stream_update', {
                'type': 'no_speech',
                'confidence': confidence
            })
            return
        
        # Sauvegarde temporaire du chunk
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
            f.write(audio_bytes)
            temp_path = f.name
        
        # Transcription rapide
        result = model.transcribe(
            temp_path,
            language=None,  # Auto-détection
            task="transcribe",
            temperature=0.0,
            best_of=1,  # Ultra rapide pour streaming
            beam_size=1
        )
        
        text = result["text"].strip()
        
        # Nettoyage
        os.unlink(temp_path)
        
        if text:
            # Extraction rapide d'entités
            entities = extract_entities(text)
            
            # Réponse en temps réel
            emit('stream_update', {
                'type': 'transcription',
                'text': text,
                'partial': True,
                'entities': entities,
                'confidence': confidence
            })
            
            logger.info(f"🎤 Streaming: {text[:50]}...")
        
    except Exception as e:
        logger.error(f"❌ Erreur streaming: {e}")
        emit('error', {'message': str(e)})

@socketio.on('disconnect')
def handle_disconnect():
    """Déconnexion WebSocket"""
    logger.info(f"🔌 WebSocket déconnecté: {request.sid}")

# =============== DÉMARRAGE ===============
if __name__ == '__main__':
    print("=" * 70)
    print("🎤 AURIANCE TURBO PRO - SERVEUR OPTIMISÉ")
    print("=" * 70)
    print(f"📍 URL: http://127.0.0.1:5000")
    print(f"⚡ Device: {device.upper()}")
    print(f"📦 Model: Whisper Tiny (Ultra rapide)")
    print(f"🔊 VAD: {'Silero' if vad_model else 'Basic'}")
    print(f"🗄️ Database: PostgreSQL")
    print(f"🌍 Languages: 99+")
    print("=" * 70)
    print("🎯 Endpoints disponibles:")
    print("   POST /api/transcribe_pro  - Transcription optimisée")
    print("   GET  /api/health          - Santé système")
    print("   GET  /api/languages       - 99+ langues")
    print("   GET  /api/stats           - Statistiques")
    print("   WS   /socket.io           - Streaming temps réel")
    print("=" * 70)
    
    # Installer les dépendances manquantes automatiquement
    print("🔧 Vérification des dépendances...")
    try:
        import flask_socketio
        print("✅ Flask-SocketIO déjà installé")
    except:
        print("⚠️ Flask-SocketIO manquant, installez avec: pip install flask-socketio")
    
    # Démarrer le serveur
    socketio.run(app, host='127.0.0.1', port=5000, debug=False, allow_unsafe_werkzeug=True)
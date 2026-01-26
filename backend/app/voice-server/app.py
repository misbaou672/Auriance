# voice-server/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os
import logging
import torch
import time
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 🔥 CONFIGURATION WHISPER
logger.info("🔊 Chargement Whisper SMALL pour Auriance...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("small", device=device)
logger.info(f"✅ Whisper chargé sur {device.upper()}!")

# 🔧 CONFIGURATION BD (env-friendly)
DB_HOST = os.getenv("WHISPER_DB_HOST", "postgres")
DB_NAME = os.getenv("WHISPER_DB_NAME", "auriance_medical")
DB_USER = os.getenv("WHISPER_DB_USER", "postgres")
DB_PASSWORD = os.getenv("WHISPER_DB_PASSWORD", "110603")
DB_PORT = os.getenv("WHISPER_DB_PORT", "5432")

# 🔥 CONNEXION BASE DE DONNÉES AURIANCE - CORRIGÉ POUR DOCKER
def get_db_connection():
    """Connexion PostgreSQL configurable via variables d'environnement."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            cursor_factory=RealDictCursor,
        )
        return conn
    except Exception as e:
        logger.error(f"❌ Erreur connexion BD ({DB_HOST}:{DB_PORT}/{DB_NAME}): {e}")
        return None

def save_consultation(medecin_id, patient_id, transcription_text, langue_detectee, duree_seconds):
    """Sauvegarde une consultation dans la BD Auriance"""
    conn = get_db_connection()
    if not conn:
        return None
        
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO consultations 
                (medecin_id, patient_id, transcription_brute, langue_detectee, duree_audio_seconds)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (medecin_id, patient_id, transcription_text, langue_detectee, duree_seconds))
            
            consultation_id = cur.fetchone()['id']
            conn.commit()
            logger.info(f"✅ Consultation sauvegardée (ID: {consultation_id})")
            return consultation_id
            
    except Exception as e:
        logger.error(f"❌ Erreur sauvegarde: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

@app.route('/')
def home():
    return """
    <html>
        <head><title>Auriance Voice Server</title></head>
        <body style="font-family: Arial; margin: 40px;">
            <h1>🎤 Serveur Vocal Auriance</h1>
            <p><strong>Transcription médicale intelligente</strong></p>
            <p>✅ Whisper Small optimisé</p>
            <p>📊 Sauvegarde automatique PostgreSQL</p>
            <p>🌍 Support multilingue</p>
            <p><em>Endpoint: POST /api/transcribe</em></p>
        </body>
    </html>
    """

@app.route('/api/transcribe', methods=['POST'])
def transcribe_turbo():
    """Endpoint principal de transcription pour Auriance"""
    start_time = time.time()
    temp_path = None
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file"}), 400
        
        # Récupère les paramètres
        medecin_id = request.form.get('medecin_id', type=int, default=1)
        patient_id = request.form.get('patient_id', type=int, default=1)
        language = request.form.get('language', 'auto')
        
        audio_file = request.files['audio']
        
        # Vérification taille fichier
        audio_file.seek(0, 2)  # Va à la fin
        file_size = audio_file.tell()
        audio_file.seek(0)     # Retour au début
        
        if file_size < 1000:
            return jsonify({"error": "Audio file too small"}), 400
        
        # Sauvegarde temporaire
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
            audio_file.save(f.name)
            temp_path = f.name

        # Configuration langue
        if language == 'auto':
            language = None
        
        # 🔥 TRANSCRIPTION WHISPER
        result = model.transcribe(
            temp_path,
            fp16=(device == "cuda"),
            language=language,
            task='transcribe',
            temperature=0.0,
            best_of=2,
            beam_size=2,
            no_speech_threshold=0.3,
            logprob_threshold=-0.4,
            compression_ratio_threshold=2.8,
            condition_on_previous_text=False,
            initial_prompt="Transcription médicale précise et rapide."
        )
        
        text = result["text"].strip()
        detected_language = result.get("language", "auto")
        processing_time = time.time() - start_time
        
        # 🔥 SAUVEGARDE DANS LA BASE AURIANCE
        consultation_id = save_consultation(
            medecin_id=medecin_id,
            patient_id=patient_id,
            transcription_text=text,
            langue_detectee=detected_language,
            duree_seconds=int(processing_time)
        )
        
        logger.info(f"🎯 Transcription réussie ({processing_time:.1f}s): '{text[:80]}{'...' if len(text) > 80 else ''}'")
        
        return jsonify({
            "success": True,
            "text": text,
            "detected_language": detected_language,
            "processing_time": round(processing_time, 1),
            "consultation_id": consultation_id,
            "engine": "whisper_small",
            "device": device
        })
                
    except Exception as e:
        logger.error(f"❌ Erreur transcription: {e}")
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Nettoyage fichier temporaire
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.warning(f"⚠️ Nettoyage temp file: {e}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état du serveur"""
    conn = get_db_connection()
    db_status = "✅" if conn else "❌"
    if conn:
        conn.close()
    
    return jsonify({
        "status": "healthy",
        "whisper_model": "small",
        "device": device,
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/languages', methods=['GET'])
def supported_languages():
    """Liste des langues supportées"""
    languages = [
        {"code": "auto", "name": "Auto-détection"},
        {"code": "fr", "name": "Français"},
        {"code": "en", "name": "Anglais"},
        {"code": "es", "name": "Espagnol"},
        {"code": "it", "name": "Italien"},
        {"code": "de", "name": "Allemand"},
        {"code": "pt", "name": "Portugais"},
        {"code": "ja", "name": "Japonais"},
        {"code": "ko", "name": "Coréen"},
        {"code": "zh", "name": "Chinois"},
        {"code": "ru", "name": "Russe"},
        {"code": "ar", "name": "Arabe"},
    ]
    return jsonify({"languages": languages})

if __name__ == '__main__':
    logger.info("🚀 Serveur Vocal Auriance démarré!")
    logger.info("📍 http://0.0.0.0:5000")
    logger.info("🎯 Endpoints:")
    logger.info("   - POST /api/transcribe")
    logger.info("   - GET  /api/health") 
    logger.info("   - GET  /api/languages")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
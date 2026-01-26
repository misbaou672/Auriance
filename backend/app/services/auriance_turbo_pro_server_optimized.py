# auriance_turbo_pro_server_optimized.py - VERSION HAUTE QUALITÉ RAPIDE
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
import sqlite3
import threading
import hashlib

# =============== CONFIGURATION ===============
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

print("=" * 70)
print("🚀 AURIANCE TURBO PRO - HAUTE QUALITÉ RAPIDE")
print("=" * 70)

# =============== CHARGEMENT MODÈLES DUAL ===============
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"⚡ Device: {device.upper()}")

# Cache pour résultats
transcription_cache = {}

# 1. MODÈLE RAPIDE (Tiny) - Pour réponse immédiate
try:
    model_fast = whisper.load_model("tiny", device=device)
    logger.info("✅ Whisper TINY chargé! (Rapide - < 1s)")
except Exception as e:
    logger.error(f"❌ Erreur Tiny: {e}")
    model_fast = None

# 2. MODÈLE QUALITÉ (Medium/Small) - Pour amélioration
try:
    # Essayer medium d'abord
    model_quality = whisper.load_model("small", device=device)  # Bon équilibre
    logger.info("✅ Whisper SMALL chargé! (Haute qualité - ~2-3s)")
    MODEL_QUALITY_NAME = "small"
except Exception as e:
    try:
        logger.warning(f"⚠️ Small échoué: {e}, essayant base...")
        model_quality = whisper.load_model("base", device=device)
        logger.info("✅ Whisper BASE chargé (qualité moyenne)")
        MODEL_QUALITY_NAME = "base"
    except:
        model_quality = model_fast  # Fallback
        MODEL_QUALITY_NAME = "tiny"
        logger.warning("⚠️ Utilisation Tiny comme fallback qualité")

# =============== FONCTION DE TRANSCRIPTION INTELLIGENTE ===============
def transcribe_intelligent(audio_path, language=None, use_cache=True):
    """Transcription intelligente : rapide d'abord, puis qualité"""
    
    # Calculer hash de l'audio pour le cache
    audio_hash = ""
    if use_cache:
        with open(audio_path, 'rb') as f:
            audio_hash = hashlib.md5(f.read()).hexdigest()
        
        if audio_hash in transcription_cache:
            logger.info(f"🔄 Utilisation cache: {audio_hash[:8]}")
            return transcription_cache[audio_hash]
    
    # ÉTAPE 1 : Transcription RAPIDE (Tiny)
    start_fast = time.time()
    if model_fast:
        result_fast = model_fast.transcribe(
            audio_path,
            language=language,
            task="transcribe",
            temperature=0.0,
            best_of=2,
            beam_size=2,
            no_speech_threshold=0.4,  # Plus sensible
            condition_on_previous_text=False
        )
        text_fast = result_fast["text"].strip()
        lang_fast = result_fast.get("language", language or "auto")
        time_fast = time.time() - start_fast
    else:
        text_fast = ""
        lang_fast = "auto"
        time_fast = 0
    
    # Réponse immédiate
    response_fast = {
        "text": text_fast,
        "detected_language": lang_fast,
        "processing_time": time_fast,
        "model": "tiny",
        "confidence": 0.7,
        "quality": "fast"
    }
    
    # ÉTAPE 2 : Amélioration QUALITÉ en background (si différent)
    if model_quality and model_quality != model_fast and text_fast:
        def improve_quality():
            try:
                start_quality = time.time()
                result_quality = model_quality.transcribe(
                    audio_path,
                    language=lang_fast,  # Utiliser langue détectée
                    task="transcribe",
                    temperature=0.0,
                    best_of=5,
                    beam_size=5,
                    patience=1.0,
                    condition_on_previous_text=True
                )
                text_quality = result_quality["text"].strip()
                time_quality = time.time() - start_quality
                
                logger.info(f"🎯 Amélioration qualité: {time_quality:.2f}s")
                logger.info(f"   Tiny: '{text_fast[:50]}...'")
                logger.info(f"   Small: '{text_quality[:50]}...'")
                
                # Stocker dans cache
                if use_cache and audio_hash:
                    transcription_cache[audio_hash] = {
                        "text": text_quality,
                        "detected_language": result_quality.get("language", lang_fast),
                        "processing_time": time_fast + time_quality,
                        "model": MODEL_QUALITY_NAME,
                        "confidence": 0.9,
                        "quality": "high"
                    }
                
                # Envoyer update via WebSocket si besoin
                # (peut être implémenté pour les clients en temps réel)
                
            except Exception as e:
                logger.error(f"❌ Erreur amélioration qualité: {e}")
        
        # Lancer en thread pour ne pas bloquer
        threading.Thread(target=improve_quality, daemon=True).start()
    
    # Retourner résultat rapide immédiatement
    if use_cache and audio_hash and text_fast:
        transcription_cache[audio_hash] = response_fast
    
    return response_fast

# =============== MODIFIE LA FONCTION transcribe_pro_optimized ===============
@app.route('/api/transcribe_pro', methods=['POST'])
def transcribe_pro_optimized():
    """Endpoint PRO avec qualité intelligente"""
    start_time = time.time()
    temp_path = None
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file", "success": False}), 400
        
        audio_file = request.files['audio']
        audio_bytes = audio_file.read()
        
        if len(audio_bytes) < 8000:
            return jsonify({"error": "Audio too short", "success": False}), 400
        
        logger.info(f"📥 Audio reçu: {len(audio_bytes)} bytes")
        
        # Détection parole (garder ta fonction existante)
        has_speech, confidence, vad_type = detect_speech_silero(audio_bytes)
        
        if not has_speech:
            return jsonify({
                "success": True,
                "text": "",
                "has_speech": False,
                "confidence": confidence,
                "vad_type": vad_type,
                "message": "No speech detected"
            })
        
        # Sauvegarde temporaire
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
            audio_file.seek(0)
            audio_file.save(f.name)
            temp_path = f.name
        
        # Paramètres
        language = request.form.get('language', 'auto')
        language = None if language == 'auto' else language
        
        # TRANSCRIPTION INTELLIGENTE
        result = transcribe_intelligent(temp_path, language)
        
        text = result["text"]
        detected_lang = result["detected_language"]
        processing_time = time.time() - start_time
        
        logger.info(f"✅ Transcription ({processing_time:.2f}s, {result['model']}, {detected_lang}): {text[:80]}...")
        
        # Sauvegarde BD + extraction entités
        session_id = f"session_{int(time.time())}_{os.urandom(4).hex()}"
        word_count = len(text.split())
        char_count = len(text)
        
        trans_id, entities = save_transcription(
            session_id, text, detected_lang, confidence, 
            processing_time, word_count, char_count
        )
        
        # Réponse avec info qualité
        response = {
            "success": True,
            "text": text,
            "detected_language": detected_lang,
            "confidence": float(confidence),
            "processing_time": float(processing_time),
            "word_count": word_count,
            "char_count": char_count,
            "entities": entities,
            "session_id": session_id,
            "transcription_id": trans_id,
            "performance": {
                "model": result["model"],
                "quality": result["quality"],
                "vad": vad_type,
                "latency": f"{processing_time:.2f}s",
                "database": "active" if trans_id else "inactive",
                "improvement_pending": model_quality != model_fast and text != ""
            },
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "audio_size_bytes": len(audio_bytes),
                "audio_duration_sec": len(audio_bytes) / 32000
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Transcription error: {e}")
        return jsonify({
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        }), 500
        
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass

# =============== NOUVEAU ENDPOINT POUR LA QUALITÉ ===============
@app.route('/api/transcribe_quality', methods=['POST'])
def transcribe_quality():
    """Endpoint dédié pour la haute qualité (plus lent)"""
    start_time = time.time()
    temp_path = None
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file", "success": False}), 400
        
        audio_file = request.files['audio']
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
            audio_file.save(f.name)
            temp_path = f.name
        
        language = request.form.get('language', 'auto')
        language = None if language == 'auto' else language
        
        # Utiliser le modèle qualité
        if model_quality:
            result = model_quality.transcribe(
                temp_path,
                language=language,
                task="transcribe",
                temperature=0.0,
                best_of=5,
                beam_size=5,
                patience=1.0,
                condition_on_previous_text=True,
                initial_prompt="Transcription précise et claire."
            )
        else:
            return jsonify({"error": "Quality model not available", "success": False}), 500
        
        text = result["text"].strip()
        detected_lang = result.get("language", language or "auto")
        processing_time = time.time() - start_time
        
        logger.info(f"🎯 QUALITÉ ({processing_time:.2f}s): {text[:100]}...")
        
        return jsonify({
            "success": True,
            "text": text,
            "detected_language": detected_lang,
            "processing_time": processing_time,
            "model": MODEL_QUALITY_NAME,
            "quality": "high",
            "word_count": len(text.split()),
            "char_count": len(text)
        })
        
    except Exception as e:
        logger.error(f"❌ Quality transcription error: {e}")
        return jsonify({"error": str(e), "success": False}), 500
        
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass

# =============== MODIFIE L'AFFICHAGE DE DÉMARRAGE ===============
if __name__ == '__main__':
    print("=" * 70)
    print("🎤 AURIANCE TURBO PRO - DUAL MODEL STRATEGY")
    print("=" * 70)
    print(f"📍 URL: http://127.0.0.1:5000")
    print(f"⚡ Device: {device.upper()}")
    print(f"📦 Modèle Rapide: Whisper Tiny (< 1s)")
    print(f"🎯 Modèle Qualité: Whisper {MODEL_QUALITY_NAME.upper()} (~2-5s)")
    print(f"🔊 VAD: {'Silero' if VAD_AVAILABLE else 'Basic'}")
    print(f"🗄️ Database: {'Active' if DB_INITIALIZED else 'Inactive'}")
    print(f"🌍 Languages: 99+")
    print("=" * 70)
    print("🎯 Endpoints disponibles:")
    print("   POST /api/transcribe_pro      - Rapide + amélioration background")
    print("   POST /api/transcribe_quality  - Haute qualité (plus lent)")
    print("   GET  /api/health              - Santé système")
    print("   GET  /api/languages           - 99+ langues")
    print("   GET  /api/stats               - Statistiques")
    print("   WS   /socket.io               - Streaming temps réel")
    print("=" * 70)
    print("🚀 Stratégie: Réponse rapide (Tiny) → Amélioration qualité (Small) en background")
    print("=" * 70)
    
    socketio.run(app, 
                 host='127.0.0.1', 
                 port=5000, 
                 debug=False, 
                 allow_unsafe_werkzeug=True,
                 log_output=False)
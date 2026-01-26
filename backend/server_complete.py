#!/usr/bin/env python3
"""
SERVEUR AURIANCE COMPLET - Avec tous les endpoints nécessaires
"""
import sys
import os
os.chdir("c:\\Users\\marec\\Documents\\auriance\\backend")
sys.path.insert(0, ".")

import threading
import time
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ============================================================
# ENDPOINTS DE BASE
# ============================================================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "version": "1.0.0"}), 200

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "AURIANCE API - Serveur opérationnel",
        "version": "1.0.0",
        "endpoints": [
            "/health",
            "/api/auriance/transcribe",
            "/api/auriance/generate-sql-query",
            "/api/auriance/generate-cypher-query"
        ]
    }), 200

# ============================================================
# ENDPOINTS AURIANCE - TRANSCRIPTION VOCALE
# ============================================================

@app.route('/api/auriance/transcribe', methods=['POST'])
def transcribe():
    """
    Transcrire un fichier audio
    Body: FormData avec audio
    """
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Fichier 'audio' requis"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "Fichier audio vide"}), 400
        
        logger.info(f"[Transcribe] Audio reçu: {audio_file.filename}")
        
        # Simulation de transcription
        transcribed_text = "Patient Jean Dupont, 45 ans, fièvre à 38.5, toux sèche"
        
        return jsonify({
            "status": "success",
            "transcribed_text": transcribed_text,
            "language": "fr",
            "confidence": 0.95
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur transcription: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# ============================================================
# ENDPOINTS AURIANCE - GÉNÉRATION DE REQUÊTES
# ============================================================

@app.route('/api/auriance/generate-sql-query', methods=['POST'])
def generate_sql():
    """
    Générer une requête SQL à partir du texte
    Body: {"text": "...", "language": "fr"}
    """
    try:
        data = request.get_json() or {}
        text = data.get('text', '')
        language = data.get('language', 'fr')
        
        if not text:
            return jsonify({"error": "Champ 'text' requis"}), 400
        
        logger.info(f"[SQL] Génération pour: {text[:50]}")
        
        # Générer une requête SQL simple
        sql_query = f"""
SELECT p.*, c.* 
FROM patients p
LEFT JOIN consultations c ON p.id = c.patient_id
WHERE c.symptoms ILIKE '%{text}%'
ORDER BY c.created_at DESC
LIMIT 100;
        """.strip()
        
        return jsonify({
            "status": "success",
            "input": text,
            "sql_query": sql_query,
            "language": language,
            "database": "postgresql"
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur SQL: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/auriance/generate-cypher-query', methods=['POST'])
def generate_cypher():
    """
    Générer une requête Cypher (Neo4j)
    Body: {"text": "...", "language": "fr"}
    """
    try:
        data = request.get_json() or {}
        text = data.get('text', '')
        language = data.get('language', 'fr')
        
        if not text:
            return jsonify({"error": "Champ 'text' requis"}), 400
        
        logger.info(f"[Cypher] Génération pour: {text[:50]}")
        
        # Générer une requête Cypher simple
        cypher_query = f"""
MATCH (p:Patient)-[c:HAS_CONSULTATION]->(con:Consultation)
WHERE con.symptoms CONTAINS '{text}'
RETURN p, con
LIMIT 100;
        """.strip()
        
        return jsonify({
            "status": "success",
            "input": text,
            "cypher_query": cypher_query,
            "language": language,
            "database": "neo4j"
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur Cypher: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# ============================================================
# ENDPOINTS AURIANCE - RECHERCHE VOCALE MULTI-BASE
# ============================================================

@app.route('/api/auriance/voice-search', methods=['POST'])
def voice_search():
    """
    Recherche vocale multi-base
    Body: FormData avec audio
    """
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Fichier 'audio' requis"}), 400
        
        audio_file = request.files['audio']
        logger.info(f"[Voice Search] Audio reçu: {audio_file.filename}")
        
        # Simulation complète du pipeline
        transcribed_text = "Chercher les patients avec de la fièvre"
        
        return jsonify({
            "status": "success",
            "transcribed_text": transcribed_text,
            "results": {
                "postgresql": [],
                "neo4j": [],
                "qdrant": []
            },
            "aggregated_answer": "Résultats de recherche vocale"
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur voice search: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# ============================================================
# GESTION DES ERREURS
# ============================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint non trouvé"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Erreur serveur interne"}), 500

# ============================================================
# LANCEMENT
# ============================================================

def run_server():
    """Lancer le serveur Flask"""
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False, threaded=True)

if __name__ == "__main__":
    logger.info("\n" + "="*70)
    logger.info("🚀 SERVEUR AURIANCE - COMPLET AVEC TOUS LES ENDPOINTS")
    logger.info("="*70)
    logger.info("📡 Écoute sur http://0.0.0.0:8000")
    logger.info("✅ Endpoints disponibles:")
    logger.info("   - /health")
    logger.info("   - /api/auriance/transcribe")
    logger.info("   - /api/auriance/generate-sql-query")
    logger.info("   - /api/auriance/generate-cypher-query")
    logger.info("   - /api/auriance/voice-search")
    logger.info("="*70 + "\n")
    
    # Démarrer le serveur
    run_server()

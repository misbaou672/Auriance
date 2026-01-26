#!/usr/bin/env python3
"""
Serveur AURIANCE FINAL avec Flask
Routes: voice-search, generate-sql-query, generate-cypher-query
"""
import sys
import os
os.chdir("c:\\Users\\marec\\Documents\\auriance\\backend")
sys.path.insert(0, ".")

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import logging
import json
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ============================================================
# ENDPOINTS DE BASE
# ============================================================

@app.route('/health', methods=['GET'])
def health():
    """Vérifier la santé du serveur"""
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "message": "AURIANCE API est opérationnel"
    }), 200

@app.route('/', methods=['GET'])
def root():
    """Endpoint racine"""
    return jsonify({
        "message": "AURIANCE API - Serveur opérationnel",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "voice-search": "/api/auriance/voice-search",
            "generate-sql": "/api/auriance/generate-sql-query",
            "generate-cypher": "/api/auriance/generate-cypher-query"
        }
    }), 200

# ============================================================
# ENDPOINTS AURIANCE
# ============================================================

@app.route('/api/auriance/form-json', methods=['GET', 'POST'])
def form_json():
    """Obtenir la structure du formulaire JSON"""
    return jsonify({
        "form_name": "Consultation Médicale AURIANCE",
        "fields": [
            {"name": "patient_name", "type": "text", "required": True, "label": "Nom du patient"},
            {"name": "patient_age", "type": "number", "required": True, "label": "Âge"},
            {"name": "symptoms", "type": "textarea", "required": True, "label": "Symptômes"},
            {"name": "temperature", "type": "number", "required": False, "label": "Température"},
            {"name": "diagnosis", "type": "text", "required": False, "label": "Diagnostic"},
            {"name": "treatment", "type": "textarea", "required": False, "label": "Traitement"}
        ]
    }), 200

@app.route('/api/auriance/generate-sql-query', methods=['POST'])
def generate_sql_query():
    """
    Générer une requête SQL à partir d'une description en langage naturel
    
    Body:
    {
        "text": "Chercher les patients avec de la fièvre",
        "language": "fr"
    }
    """
    try:
        data = request.get_json() or {}
        text = data.get('text', '')
        language = data.get('language', 'fr')
        
        if not text:
            return jsonify({"error": "Champ 'text' requis"}), 400
        
        logger.info(f"[SQL] Génération pour: {text}")
        
        # Exemple simple de génération SQL
        sql_query = f"""
        SELECT p.*, c.* 
        FROM patients p
        LEFT JOIN consultations c ON p.id = c.patient_id
        WHERE c.symptoms ILIKE '%{text}%'
        ORDER BY c.created_at DESC
        LIMIT 100
        """
        
        return jsonify({
            "status": "success",
            "input": text,
            "sql_query": sql_query.strip(),
            "language": language
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur génération SQL: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/auriance/generate-cypher-query', methods=['POST'])
def generate_cypher_query():
    """
    Générer une requête Cypher (Neo4j) à partir d'une description en langage naturel
    
    Body:
    {
        "text": "Trouver tous les patients atteints de grippe",
        "language": "fr"
    }
    """
    try:
        data = request.get_json() or {}
        text = data.get('text', '')
        language = data.get('language', 'fr')
        
        if not text:
            return jsonify({"error": "Champ 'text' requis"}), 400
        
        logger.info(f"[Cypher] Génération pour: {text}")
        
        # Exemple simple de génération Cypher
        cypher_query = f"""
        MATCH (p:Patient)-[c:HAS_CONSULTATION]->(con:Consultation)
        WHERE con.symptoms CONTAINS '{text}'
        RETURN p, con
        LIMIT 100
        """
        
        return jsonify({
            "status": "success",
            "input": text,
            "cypher_query": cypher_query.strip(),
            "language": language
        }), 200
        
    except Exception as e:
        logger.error(f"Erreur génération Cypher: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/auriance/voice-search', methods=['POST'])
def voice_search():
    """
    Endpoint pour recherche vocale multi-base
    Accepte audio mp3/wav et retourne les résultats
    
    Form Data:
    - audio: fichier audio (multipart)
    - language: langue (optionnel, défaut: 'fr')
    """
    try:
        # Vérifier si un fichier audio a été envoyé
        if 'audio' not in request.files:
            return jsonify({"error": "Fichier 'audio' requis"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "Fichier audio vide"}), 400
        
        language = request.form.get('language', 'fr')
        
        logger.info(f"[Voice Search] Audio reçu: {audio_file.filename}, langue: {language}")
        
        # Pour maintenant, retourner une réponse simulée
        return jsonify({
            "status": "success",
            "message": "Recherche vocale en cours...",
            "audio_file": audio_file.filename,
            "language": language,
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
    return jsonify({"error": "Endpoint non trouvé", "status": 404}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Erreur serveur interne", "status": 500}), 500

if __name__ == "__main__":
    logger.info("="*60)
    logger.info("🚀 Démarrage du serveur AURIANCE avec Flask")
    logger.info("📡 Écoute sur http://0.0.0.0:8000")
    logger.info("📚 Documentation: http://0.0.0.0:8000/")
    logger.info("="*60)
    
    # Démarrer le serveur
    app.run(
        host="0.0.0.0",
        port=8000,
        debug=False,
        use_reloader=False,
        threaded=True
    )

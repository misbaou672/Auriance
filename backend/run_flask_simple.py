#!/usr/bin/env python3
"""
🚀 SERVEUR AURIANCE FLASK - SIMPLE ET ROBUSTE
Fonctionne parfaitement sur Windows sans problèmes asyncio
"""

import sys
import os

# Force UTF-8 sur Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Créer l'app Flask
app = Flask(__name__)
CORS(app)

# ============================================================================
# ENDPOINTS MIROIR DE L'API AURIANCE
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Vérifier que le serveur est actif"""
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/api/auriance/transcribe', methods=['POST'])
def transcribe():
    """
    ✅ Transcrire un fichier audio
    """
    try:
        logger.info("[Transcribe] Requête reçue")
        
        # Vérifier qu'on a un fichier audio
        if 'audio' not in request.files:
            return jsonify({"error": "Fichier 'audio' requis"}), 400
        
        audio_file = request.files['audio']
        logger.info(f"[Transcribe] Audio reçu: {audio_file.filename} ({len(audio_file.read())} bytes)")
        
        # Simulé pour maintenant
        transcribed_text = "Patient Jean Dupont, 45 ans, fièvre à 38.5, toux sèche"
        
        return jsonify({
            "success": True,
            "transcription": transcribed_text,
            "language": "fr",
            "confidence": 0.95
        }), 200
    
    except Exception as e:
        logger.error(f"[Transcribe] Erreur: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auriance/transcribe-and-extract', methods=['POST'])
def transcribe_and_extract():
    """
    ✅ Transcrire + Extraire les infos
    """
    try:
        logger.info("[Transcribe+Extract] Requête reçue")
        
        if 'audio' not in request.files:
            return jsonify({"error": "Fichier 'audio' requis"}), 400
        
        audio_file = request.files['audio']
        logger.info(f"[Transcribe+Extract] Audio: {audio_file.filename}")
        
        transcribed_text = "Patient Jean Dupont, 45 ans"
        extracted_fields = {
            "nom": "Jean Dupont",
            "age": "45"
        }
        
        return jsonify({
            "success": True,
            "transcription": transcribed_text,
            "language": "fr",
            "extracted_fields": extracted_fields
        }), 200
    
    except Exception as e:
        logger.error(f"[Transcribe+Extract] Erreur: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auriance/generate-form-json', methods=['POST'])
def generate_form_json():
    """
    ✅ Générer JSON pour formulaires
    """
    try:
        transcription = request.form.get('transcription', '')
        logger.info(f"[FormJSON] Requête reçue: {transcription[:50]}")
        
        form_json = {
            "nom": "Jean Dupont",
            "age": "45",
            "telephone": "06 12 34 56 78"
        }
        
        return jsonify({
            "success": True,
            "form_json": form_json
        }), 200
    
    except Exception as e:
        logger.error(f"[FormJSON] Erreur: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auriance/generate-sql-query', methods=['POST'])
def generate_sql_query():
    """
    ✅ Générer requête SQL
    """
    try:
        intent = request.form.get('intent', '')
        logger.info(f"[SQL] Requête reçue: {intent}")
        
        sql_query = "SELECT * FROM patients WHERE age > 40"
        
        return jsonify({
            "success": True,
            "sql": sql_query,
            "details": {
                "query": sql_query,
                "table": "patients",
                "type": "SELECT"
            }
        }), 200
    
    except Exception as e:
        logger.error(f"[SQL] Erreur: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auriance/generate-cypher-query', methods=['POST'])
def generate_cypher_query():
    """
    ✅ Générer requête Cypher (Neo4j)
    """
    try:
        intent = request.form.get('intent', '')
        logger.info(f"[Cypher] Requête reçue: {intent}")
        
        cypher_query = "MATCH (p:Patient) RETURN p LIMIT 10"
        
        return jsonify({
            "success": True,
            "cypher": cypher_query,
            "details": {
                "query": cypher_query,
                "type": "MATCH"
            }
        }), 200
    
    except Exception as e:
        logger.error(f"[Cypher] Erreur: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auriance/rag-answer', methods=['POST'])
def rag_answer():
    """
    ✅ Répondre via RAG
    """
    try:
        question = request.form.get('question', '')
        logger.info(f"[RAG] Question: {question}")
        
        answer = "La fièvre est une réaction immunitaire de l'organisme. Elle doit être traitée..."
        
        return jsonify({
            "success": True,
            "answer": answer,
            "language": "fr",
            "sources": []
        }), 200
    
    except Exception as e:
        logger.error(f"[RAG] Erreur: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================================================
# LANCEMENT
# ============================================================================

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 SERVEUR AURIANCE - FLASK")
    print("="*70)
    print(f"✅ Démarrage sur http://0.0.0.0:8000")
    print(f"✅ Health check: GET http://127.0.0.1:8000/health")
    print(f"✅ Transcription: POST http://127.0.0.1:8000/api/auriance/transcribe")
    print(f"✅ Mode: Production (multithreading)")
    print("="*70 + "\n")
    
    # Démarrer le serveur Flask
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=False,
        threaded=True,
        use_reloader=False
    )

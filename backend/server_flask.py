#!/usr/bin/env python3
"""
Serveur AURIANCE avec Flask (stable sur Windows)
"""
import sys
import os
os.chdir("c:\\Users\\marec\\Documents\\auriance\\backend")
sys.path.insert(0, ".")

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "version": "1.0.0"}), 200

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "AURIANCE API - Serveur opérationnel",
        "endpoints": {
            "health": "/health",
            "docs": "/docs"
        }
    }), 200

@app.route('/api/auriance/form-json', methods=['POST'])
def form_json():
    """Endpoint pour obtenir la structure du formulaire JSON"""
    return jsonify({
        "form_name": "Consultation Médicale",
        "fields": [
            {"name": "patient_name", "type": "text", "required": True},
            {"name": "patient_age", "type": "number", "required": True},
            {"name": "symptoms", "type": "text", "required": True},
            {"name": "temperature", "type": "number", "required": False},
        ]
    }), 200

if __name__ == "__main__":
    logger.info("🚀 Démarrage du serveur AURIANCE avec Flask...")
    logger.info("📡 Écoute sur http://0.0.0.0:8000")
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False, threaded=True)

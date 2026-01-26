#!/usr/bin/env python3
"""
AURIANCE Server avec tests intégrés - Tout dans un processus
"""
import sys
import os
os.chdir("c:\\Users\\marec\\Documents\\auriance\\backend")
sys.path.insert(0, ".")

import threading
import time
import requests
import json
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================
# CRÉATION DE L'APP FLASK
# ============================================================

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "version": "1.0.0"}), 200

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "AURIANCE API",
        "version": "1.0.0"
    }), 200

@app.route('/api/auriance/generate-sql-query', methods=['POST'])
def generate_sql():
    data = request.get_json() or {}
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "text requis"}), 400
    
    sql = f"SELECT * FROM consultations WHERE symptoms ILIKE '%{text}%'"
    return jsonify({
        "status": "success",
        "input": text,
        "sql_query": sql
    }), 200

@app.route('/api/auriance/generate-cypher-query', methods=['POST'])
def generate_cypher():
    data = request.get_json() or {}
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "text requis"}), 400
    
    cypher = f"MATCH (c:Consultation) WHERE c.symptoms CONTAINS '{text}' RETURN c"
    return jsonify({
        "status": "success",
        "input": text,
        "cypher_query": cypher
    }), 200

# ============================================================
# LANCEMENT DU SERVEUR DANS UN THREAD
# ============================================================

def run_server():
    """Exécuter le serveur Flask"""
    app.run(host="0.0.0.0", port=8000, debug=False, use_reloader=False, threaded=True)

# ============================================================
# TESTS
# ============================================================

def run_tests():
    """Exécuter les tests"""
    time.sleep(3)  # Laisser le serveur démarrer
    
    logger.info("\n" + "="*60)
    logger.info("TESTS ENDPOINTS AURIANCE")
    logger.info("="*60)
    
    base_url = "http://127.0.0.1:8000"
    passed = 0
    failed = 0
    
    # Test 1: /health
    logger.info("\n[1/4] Test /health...")
    try:
        r = requests.get(f"{base_url}/health", timeout=3)
        if r.status_code == 200:
            logger.info("✅ /health: PASS")
            logger.info(f"     Response: {r.json()}")
            passed += 1
        else:
            logger.error(f"❌ /health: Status {r.status_code}")
            failed += 1
    except Exception as e:
        logger.error(f"❌ /health: {e}")
        failed += 1
    
    # Test 2: /
    logger.info("\n[2/4] Test /...")
    try:
        r = requests.get(f"{base_url}/", timeout=3)
        if r.status_code == 200:
            logger.info("✅ /: PASS")
            logger.info(f"     Response: {r.json()}")
            passed += 1
        else:
            logger.error(f"❌ /: Status {r.status_code}")
            failed += 1
    except Exception as e:
        logger.error(f"❌ /: {e}")
        failed += 1
    
    # Test 3: /api/auriance/generate-sql-query
    logger.info("\n[3/4] Test /api/auriance/generate-sql-query...")
    try:
        r = requests.post(
            f"{base_url}/api/auriance/generate-sql-query",
            json={"text": "patients avec fièvre", "language": "fr"},
            timeout=3
        )
        if r.status_code == 200 and "sql_query" in r.json():
            logger.info("✅ /api/auriance/generate-sql-query: PASS")
            logger.info(f"     SQL: {r.json()['sql_query']}")
            passed += 1
        else:
            logger.error(f"❌ /api/auriance/generate-sql-query: Invalid response")
            failed += 1
    except Exception as e:
        logger.error(f"❌ /api/auriance/generate-sql-query: {e}")
        failed += 1
    
    # Test 4: /api/auriance/generate-cypher-query
    logger.info("\n[4/4] Test /api/auriance/generate-cypher-query...")
    try:
        r = requests.post(
            f"{base_url}/api/auriance/generate-cypher-query",
            json={"text": "patients avec grippe", "language": "fr"},
            timeout=3
        )
        if r.status_code == 200 and "cypher_query" in r.json():
            logger.info("✅ /api/auriance/generate-cypher-query: PASS")
            logger.info(f"     Cypher: {r.json()['cypher_query']}")
            passed += 1
        else:
            logger.error(f"❌ /api/auriance/generate-cypher-query: Invalid response")
            failed += 1
    except Exception as e:
        logger.error(f"❌ /api/auriance/generate-cypher-query: {e}")
        failed += 1
    
    # Résumé
    logger.info("\n" + "="*60)
    logger.info(f"RÉSUMÉ: {passed} PASS, {failed} FAIL")
    logger.info("="*60)
    
    if failed == 0:
        logger.info("\n🎉 TOUS LES TESTS SONT PASSÉS!")
    else:
        logger.warning(f"\n⚠️ {failed} test(s) ont échoué")
    
    # Garder le serveur actif indéfiniment après les tests
    logger.info("\n✅ Serveur AURIANCE est ACTIF et STABLE")
    logger.info("📡 Écoute sur http://0.0.0.0:8000")
    logger.info("🔄 Appuyez sur Ctrl+C pour arrêter\n")
    
    while True:
        time.sleep(1)

if __name__ == "__main__":
    logger.info("\n" + "="*60)
    logger.info("🚀 SERVEUR AURIANCE - DÉMARRAGE")
    logger.info("="*60 + "\n")
    
    # Démarrer le serveur dans un thread
    server_thread = threading.Thread(target=run_server, daemon=False)
    server_thread.start()
    
    # Exécuter les tests dans le main thread
    try:
        run_tests()
    except KeyboardInterrupt:
        logger.info("\n\n👋 Arrêt du serveur...")
        sys.exit(0)

#!/usr/bin/env python3
"""
Script de test pour les endpoints AURIANCE
"""
import sys
import requests
import json
import time
import logging

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')
logger = logging.getLogger(__name__)

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test endpoint /health"""
    logger.info("\n" + "="*60)
    logger.info("TEST 1: /health")
    logger.info("="*60)
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        logger.info(f"✅ Status: {r.status_code}")
        logger.info(f"Response: {json.dumps(r.json(), indent=2)}")
        return r.status_code == 200
    except Exception as e:
        logger.error(f"❌ Erreur: {e}")
        return False

def test_root():
    """Test endpoint /"""
    logger.info("\n" + "="*60)
    logger.info("TEST 2: /")
    logger.info("="*60)
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        logger.info(f"✅ Status: {r.status_code}")
        logger.info(f"Response: {json.dumps(r.json(), indent=2)}")
        return r.status_code == 200
    except Exception as e:
        logger.error(f"❌ Erreur: {e}")
        return False

def test_generate_sql():
    """Test endpoint /api/auriance/generate-sql-query"""
    logger.info("\n" + "="*60)
    logger.info("TEST 3: /api/auriance/generate-sql-query")
    logger.info("="*60)
    try:
        payload = {
            "text": "Chercher les patients avec de la fièvre",
            "language": "fr"
        }
        r = requests.post(f"{BASE_URL}/api/auriance/generate-sql-query", json=payload, timeout=5)
        logger.info(f"✅ Status: {r.status_code}")
        logger.info(f"Response: {json.dumps(r.json(), indent=2)}")
        return r.status_code == 200
    except Exception as e:
        logger.error(f"❌ Erreur: {e}")
        return False

def test_generate_cypher():
    """Test endpoint /api/auriance/generate-cypher-query"""
    logger.info("\n" + "="*60)
    logger.info("TEST 4: /api/auriance/generate-cypher-query")
    logger.info("="*60)
    try:
        payload = {
            "text": "Trouver tous les patients atteints de grippe",
            "language": "fr"
        }
        r = requests.post(f"{BASE_URL}/api/auriance/generate-cypher-query", json=payload, timeout=5)
        logger.info(f"✅ Status: {r.status_code}")
        logger.info(f"Response: {json.dumps(r.json(), indent=2)}")
        return r.status_code == 200
    except Exception as e:
        logger.error(f"❌ Erreur: {e}")
        return False

def main():
    logger.info("""
    ╔══════════════════════════════════════════════════════════════╗
    ║          TESTS ENDPOINTS AURIANCE API                        ║
    ║         Base URL: http://127.0.0.1:8000                      ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    results = []
    
    # Attendre un peu pour que le serveur soit prêt
    time.sleep(1)
    
    results.append(("Health", test_health()))
    results.append(("Root", test_root()))
    results.append(("Generate SQL", test_generate_sql()))
    results.append(("Generate Cypher", test_generate_cypher()))
    
    # Résumé
    logger.info("\n" + "="*60)
    logger.info("RÉSUMÉ DES TESTS")
    logger.info("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{status}: {name}")
    
    logger.info(f"\nTotal: {passed}/{total} tests réussis")
    
    if passed == total:
        logger.info("\n🎉 TOUS LES TESTS SONT PASSÉS!")
        return 0
    else:
        logger.error(f"\n⚠️ {total - passed} test(s) ont échoué")
        return 1

if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Script de test pour l'API AURIANCE
Teste tous les endpoints
"""
import requests
import json
import os
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000"
API_ENDPOINT = f"{API_URL}/api/auriance"

# Couleurs pour les logs
RED = '\033[91m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_info(msg):
    print(f"{BLUE}ℹ️  {msg}{RESET}")

def log_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def log_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def log_step(msg):
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}🧪 {msg}{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")


# ==================== TEST 1: Health Check ====================

def test_health_check():
    log_step("Test 1: Health Check")
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            log_success(f"API Online: {response.json()}")
            return True
        else:
            log_error(f"API Status: {response.status_code}")
            return False
    except Exception as e:
        log_error(f"Impossible de se connecter à {API_URL}: {e}")
        return False


# ==================== TEST 2: Transcribe ====================

def test_transcribe():
    log_step("Test 2: Transcription audio")
    
    # Créer un fichier audio de test simple (WAV silence)
    import wave
    import struct
    
    test_audio = "test_audio.wav"
    
    try:
        # Créer un fichier WAV simple
        with wave.open(test_audio, 'w') as wav_file:
            nchannels = 1
            sampwidth = 2
            framerate = 16000
            nframes = 16000  # 1 seconde
            
            wav_file.setnchannels(nchannels)
            wav_file.setsampwidth(sampwidth)
            wav_file.setframerate(framerate)
            
            # Silence
            data = b'\x00\x00' * nframes
            wav_file.writeframes(data)
        
        log_info("Fichier audio de test créé")
        
        # Envoyer la requête
        with open(test_audio, 'rb') as f:
            files = {'audio_file': f}
            data = {'language': 'fr'}
            
            response = requests.post(
                f"{API_ENDPOINT}/transcribe",
                files=files,
                data=data
            )
        
        if response.status_code == 200:
            result = response.json()
            log_success(f"Transcription réussie:")
            log_info(f"  Texte: {result.get('transcription', 'N/A')}")
            log_info(f"  Langue: {result.get('language', 'N/A')}")
            return result.get('transcription', '')
        else:
            log_error(f"Erreur {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        log_error(f"Erreur test transcription: {e}")
        return None
    
    finally:
        if os.path.exists(test_audio):
            os.remove(test_audio)
            log_info("Fichier de test supprimé")


# ==================== TEST 3: Extract Fields ====================

def test_extract_fields():
    log_step("Test 3: Extraction de champs")
    
    test_text = "Je m'appelle Jean Dupont, j'ai 30 ans, mon email est jean@example.com et mon téléphone est 06 12 34 56 78"
    
    try:
        response = requests.post(
            f"{API_ENDPOINT}/generate-form-json",
            data={'transcription': test_text}
        )
        
        if response.status_code == 200:
            result = response.json()
            log_success("Extraction réussie:")
            log_info(f"  Champs extraits: {json.dumps(result.get('form_json', {}), ensure_ascii=False, indent=2)}")
            return result
        else:
            log_error(f"Erreur {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        log_error(f"Erreur extraction: {e}")
        return None


# ==================== TEST 4: Generate SQL ====================

def test_generate_sql():
    log_step("Test 4: Génération de requête SQL")
    
    test_intent = "Afficher tous les projets sur la biodiversité"
    
    try:
        response = requests.post(
            f"{API_ENDPOINT}/generate-sql-query",
            data={'intent': test_intent}
        )
        
        if response.status_code == 200:
            result = response.json()
            log_success("Génération SQL réussie:")
            sql_data = result.get('sql', {})
            log_info(f"  Action: {sql_data.get('action', 'N/A')}")
            log_info(f"  Requête: {sql_data.get('query', 'N/A')}")
            return result
        else:
            log_error(f"Erreur {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        log_error(f"Erreur génération SQL: {e}")
        return None


# ==================== TEST 5: Generate Cypher ====================

def test_generate_cypher():
    log_step("Test 5: Génération de requête Cypher (Neo4j)")
    
    test_intent = "Afficher les projets liés à la biodiversité"
    
    try:
        response = requests.post(
            f"{API_ENDPOINT}/generate-cypher-query",
            data={'intent': test_intent}
        )
        
        if response.status_code == 200:
            result = response.json()
            log_success("Génération Cypher réussie:")
            cypher_data = result.get('cypher', {})
            log_info(f"  Requête: {cypher_data.get('query', 'N/A')}")
            return result
        else:
            log_error(f"Erreur {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        log_error(f"Erreur génération Cypher: {e}")
        return None


# ==================== TEST 6: Generate Report ====================

def test_generate_report():
    log_step("Test 6: Génération de rapport")
    
    test_text = "Patient Jean Martin, 45 ans, allergies à la pénicilline, consultation pour douleur dorsale"
    
    try:
        response = requests.post(
            f"{API_ENDPOINT}/generate-report",
            data={
                'transcription': test_text,
                'report_type': 'medical',
                'format': 'json'
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            log_success("Génération rapport réussie:")
            report = result.get('report', {}).get('json', {})
            log_info(f"  Type: {report.get('type', 'N/A')}")
            log_info(f"  Titre: {report.get('title', 'N/A')}")
            return result
        else:
            log_error(f"Erreur {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        log_error(f"Erreur génération rapport: {e}")
        return None


# ==================== TEST 7: Generate Summary ====================

def test_generate_summary():
    log_step("Test 7: Génération de résumé")
    
    test_text = "Le patient Jean Martin est arrivé pour une consultation générale. Il se plaint de douleurs dorsales depuis deux semaines. Il a des antécédents familiaux de diabète. Allergie confirmée à la pénicilline. Nous recommandons une radiographie et un suivi avec un physiothérapeute."
    
    try:
        response = requests.post(
            f"{API_ENDPOINT}/generate-summary",
            data={
                'transcription': test_text,
                'max_length': 200
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            log_success("Génération résumé réussie:")
            summary_data = result.get('summary', {})
            log_info(f"  Résumé: {summary_data.get('summary', 'N/A')}")
            log_info(f"  Ratio compression: {summary_data.get('compression_ratio', 'N/A'):.2%}")
            return result
        else:
            log_error(f"Erreur {response.status_code}: {response.text}")
            return None
    
    except Exception as e:
        log_error(f"Erreur génération résumé: {e}")
        return None


# ==================== MAIN ====================

def main():
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}🎤 AURIANCE API TEST SUITE{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    tests = [
        ("Health Check", test_health_check),
        ("Transcription", test_transcribe),
        ("Extraction de champs", test_extract_fields),
        ("Génération SQL", test_generate_sql),
        ("Génération Cypher", test_generate_cypher),
        ("Génération de rapport", test_generate_report),
        ("Génération de résumé", test_generate_summary),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result is not None))
        except Exception as e:
            log_error(f"Exception non gérée: {e}")
            results.append((test_name, False))
    
    # Résumé
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}📊 RÉSUMÉ DES TESTS{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"  {status} - {test_name}")
    
    print(f"\n  {BLUE}Total: {passed}/{total} tests réussis{RESET}\n")
    
    if passed == total:
        log_success("Tous les tests sont passés! 🎉")
    else:
        log_error(f"{total - passed} test(s) échoué(s)")
    
    print(f"{BLUE}{'='*60}{RESET}\n")


if __name__ == "__main__":
    main()

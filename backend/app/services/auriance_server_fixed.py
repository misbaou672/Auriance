# auriance_server_fixed.py - SERVEUR SIMPLE ET FONCTIONNEL
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Autoriser toutes les origines

print("=" * 70)
print("🎤 AURIANCE SERVEUR - VERSION SIMPLIFIÉE")
print("=" * 70)

@app.route('/')
def home():
    return '''
    <html>
    <head><title>Auriance Server</title></head>
    <body style="font-family: Arial; margin: 40px;">
        <h1>✅ Auriance Server - ACTIF</h1>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 10px;">
            <p><strong>Status: 🟢 EN LIGNE</strong></p>
            <p>📍 URL: http://127.0.0.1:5000</p>
            <p>🕐 Démarrage: ''' + datetime.now().strftime("%H:%M:%S") + '''</p>
        </div>
        <h3>📡 Endpoints disponibles:</h3>
        <ul>
            <li><a href="/api/health">GET /api/health</a> - Vérifier la santé</li>
            <li><a href="/api/test">GET /api/test</a> - Test simple</li>
            <li>POST /api/transcribe - Transcription audio</li>
        </ul>
    </body>
    </html>
    '''

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "auriance-server",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": [
            "/api/health",
            "/api/test", 
            "/api/transcribe"
        ]
    })

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        "success": True,
        "message": "Le serveur fonctionne correctement!",
        "time": datetime.now().strftime("%H:%M:%S"),
        "date": datetime.now().strftime("%Y-%m-%d")
    })

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    """Endpoint de transcription simulée"""
    try:
        # Vérifier si un fichier audio est envoyé
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "error": "No audio file provided",
                "message": "Please send an audio file with key 'audio'"
            }), 400
        
        audio_file = request.files['audio']
        filename = audio_file.filename
        
        # Simuler un traitement
        time.sleep(0.5)  # Simuler un délai de traitement
        
        # Réponse de test
        return jsonify({
            "success": True,
            "text": "Ceci est une transcription de test. Le serveur fonctionne correctement.",
            "filename": filename,
            "language": "fr",
            "processing_time": 0.5,
            "timestamp": datetime.now().isoformat(),
            "note": "Mode simulation - Pour la vraie transcription, installez Whisper"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/echo', methods=['POST'])
def echo():
    """Echo endpoint pour debug"""
    try:
        data = request.get_json()
        return jsonify({
            "success": True,
            "echo": data,
            "received_at": datetime.now().isoformat(),
            "message": "Données reçues avec succès"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

if __name__ == '__main__':
    print("🎯 Serveur démarré sur http://127.0.0.1:5000")
    print("📡 Endpoints:")
    print("   • GET  /              - Page d'accueil")
    print("   • GET  /api/health    - Vérification santé")
    print("   • GET  /api/test      - Test simple")
    print("   • POST /api/transcribe- Transcription")
    print("   • POST /api/echo      - Echo pour debug")
    print("=" * 70)
    
    # Démarrer le serveur
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True,  # Mode debug pour voir les erreurs
        use_reloader=False  # Désactiver le reloader pour éviter les problèmes
    )
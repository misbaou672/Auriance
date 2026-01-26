from __future__ import annotations # Permet l'usage des types comme des chaînes de caractères

import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager
from app.api.routes.voice_recognition_routes import router as voice_recognition_router
from app.api.routes.auriance_routes import router as auriance_router
from app.api.routes.data_routes import router as data_router
from app.api.routes.user_routes import router as users_router
from app.api.routes.auth_routes import router as auth_router
from app.api.routes.translation_routes import router as translation_router
from app.db.session import init_db, SessionLocal
from app.crud.user_crud import get_user_by_username, create_user
from app.schemas import UserCreate

# Placeholders pour les imports complexes qui pourraient manquer dans un environnement minimal
try:
    # Si ces modules étaient présents
    import numpy as np
    import cv2 
    from fastapi import File, UploadFile
    HAS_COMPLEX_IMPORTS = True
except ImportError:
    # Sinon, on utilise des placeholders pour la compatibilité
    class PlaceholderFile:
        def __init__(self, filename="placeholder.wav"):
            self.filename = filename
            
        async def read(self):
            return b"dummy_audio_data"
            
    class PlaceholderUploadFile(PlaceholderFile):
        async def close(self):
            pass
            
    # On assigne les classes placeholder pour éviter l'erreur NameError
    File = lambda *args, **kwargs: PlaceholderFile()
    UploadFile = PlaceholderUploadFile # Définition de UploadFile pour le reste du script
    HAS_COMPLEX_IMPORTS = False

# Importations FastAPI (après la gestion des imports conditionnels)
from fastapi import FastAPI, HTTPException, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect
from fastapi.responses import HTMLResponse

# ==================== DÉFINITIONS DES SERVICES ASYNCHRONES (Placeholders) ====================

# Tous les services qui effectuent des opérations I/O (AI, DB, Fichiers) doivent être ASYNCHRONES
# Nous utilisons 'await asyncio.sleep(0.1)' pour simuler le temps d'attente non bloquant.

async def _simulate_delay(seconds: float = 0.1):
    """Simule une opération I/O non bloquante."""
    await asyncio.sleep(seconds)

class BaseService:
    def __init__(self, name: str):
        self.name = name
        self.initialized = False

    async def initialize(self):
        print(f"   -> Initialisation de {self.name}...")
        await _simulate_delay(0.2)
        self.initialized = True
        print(f"   -> {self.name} prêt.")
    
    async def close(self):
        print(f"   -> Arrêt de {self.name}...")
        await _simulate_delay(0.05)


# Placeholders spécifiques
class DatabaseService(BaseService):
    def __init__(self):
        super().__init__("DatabaseService")
        self.conn = "ASYNCPG_CONN_POOL" # Simule une connexion asynchrone

class VoiceService(BaseService):
    def __init__(self):
        super().__init__("VoiceService")

    # CORRECTION : 'UploadFile' est mis en chaîne de caractères pour Pylance (Ligne 118)
    async def transcribe_audio(self, file: 'UploadFile'):
        await _simulate_delay(0.5)
        return {"filename": file.filename, "transcription": "Ceci est un test vocal basique.", "source": self.name}
    
    async def speak_text(self, text: str):
        await _simulate_delay(0.3)
        return {"status": "tts_completed"}

class CameraService(BaseService):
    def __init__(self):
        super().__init__("CameraService")

    async def analyze_frame(self, image_data: bytes):
        await _simulate_delay(0.8)
        return {"analysis": "Posture Correcte détectée.", "score": 0.95}

class AIService(BaseService):
    def __init__(self):
        super().__init__("AIService")

    async def generate_response(self, message: str) -> str:
        await _simulate_delay(0.4)
        return f"Réponse IA basique pour '{message}'. (Universelle)"

class AurianRAGEngine(BaseService):
    def __init__(self):
        super().__init__("AurianRAGEngine")

class AurianHealthService(BaseService):
    def __init__(self):
        super().__init__("AurianHealthService")

    async def generate_medical_response(self, message: str):
        await _simulate_delay(0.6)
        return {
            "response": f"Analyse médicale Aurian pour '{message}' : Recommandations de suivi régulier.",
            "context": "cardio",
            "type": "conseil",
            "urgency_level": "low"
        }

class AurianVoiceService(BaseService):
    def __init__(self):
        super().__init__("AurianVoiceService")
        
    # CORRECTION : 'UploadFile' est mis en chaîne de caractères pour Pylance (Ligne 259)
    async def transcribe_medical_audio(self, file: 'UploadFile'):
        await _simulate_delay(0.7)
        return {"filename": file.filename, "transcription": "Rapport médical : patient stable, traitement à ajuster.", "confidence": 0.98, "source": self.name}
    
    async def speak_medical_response(self, text: str):
        await _simulate_delay(0.4)
        return {"status": "tts_completed"}
    
class UniversalAIService(BaseService):
    def __init__(self):
        super().__init__("UniversalAIService")

    async def generate_response(self, message: str) -> str:
        await _simulate_delay(0.5)
        message_lower = message.lower()
        if "urgence" in message_lower:
            return "🚨 ALERTE URGENCE! Contactez immédiatement le 15 ou le 112. Votre message indique un besoin critique."
        return f"Traitement avancé par l'IA Universelle : {message}. (Basé sur le RAG Aurian)."
    
# ==================== VARIABLES GLOBALES ET INITIALISATION ====================

# CORRECTION : Les annotations complètes sont mises en chaîne de caractères pour Pylance (Ligne 281)
# Si 'from __future__ import annotations' ne suffit pas, les guillemets garantissent la résolution.
database_service: 'Optional[DatabaseService]' = None
voice_service: 'Optional[VoiceService]' = None
camera_service: 'Optional[CameraService]' = None
ai_service: 'Optional[AIService]' = None
universal_ai_service: 'Optional[UniversalAIService]' = None
aurian_health_service: 'Optional[AurianHealthService]' = None
aurian_voice_service: 'Optional[AurianVoiceService]' = None
aurian_rag_engine: 'Optional[AurianRAGEngine]' = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestionnaire de cycle de vie pour initialiser et fermer les services.
    C'est ici que l'on s'assure que les services asynchrones sont prêts AVANT que l'API ne démarre.
    """
    global database_service, voice_service, camera_service, ai_service, universal_ai_service, aurian_health_service, aurian_voice_service, aurian_rag_engine
    
    print("🚀 Démarrage des services AurianceLumène...")
    
    # Initialisation de tous les services
    aurian_rag_engine = AurianRAGEngine()
    await aurian_rag_engine.initialize() 
    
    universal_ai_service = UniversalAIService()
    await universal_ai_service.initialize()
    
    database_service = DatabaseService()
    await database_service.initialize()
    # Initialiser la base de données (SQLite) pour les routes /data/*
    try:
        init_db()
        print("✅ Base de données initialisée (SQLite)")
    except Exception as e:
        print(f"⚠️ Échec initialisation BD: {e}")
    
    # Seed default users if missing to ensure authentication works out-of-the-box
    try:
        from app.crud.user_crud import update_user
        from app.services.auth_service import get_password_hash, verify_password

        db = SessionLocal()
        # Admin user: create or ensure password
        admin_user = get_user_by_username(db, "admin")
        if not admin_user:
            create_user(
                db,
                UserCreate(
                    username="admin",
                    email="admin@auriance.com",
                    password="admin123",
                    full_name="Admin",
                ),
            )
            print("✅ Utilisateur 'admin' initialisé")
        else:
            # Ensure known password works
            if not verify_password("admin123", admin_user.hashed_password):
                update_user(db, admin_user.id, {
                    "hashed_password": get_password_hash("admin123")
                })
                print("🔒 Mot de passe 'admin' réinitialisé")

        # Test user: create or ensure password
        test_user = get_user_by_username(db, "testuser")
        if not test_user:
            create_user(
                db,
                UserCreate(
                    username="testuser",
                    email="test@auriance.com",
                    password="test123",
                    full_name="User Test",
                ),
            )
            print("✅ Utilisateur 'testuser' initialisé")
        else:
            if not verify_password("test123", test_user.hashed_password):
                update_user(db, test_user.id, {
                    "hashed_password": get_password_hash("test123")
                })
                print("🔒 Mot de passe 'testuser' réinitialisé")

        # Emma User (Requested by user)
        emma_user = get_user_by_username(db, "emma_moreau")
        if not emma_user:
            create_user(
                db,
                UserCreate(
                    username="emma_moreau",
                    email="emma@auriance.com",
                    password="password123",
                    full_name="Emma Moreau",
                ),
            )
            print("✅ Utilisateur 'emma_moreau' initialisé")
        else:
             if not verify_password("password123", emma_user.hashed_password):
                update_user(db, emma_user.id, {
                    "hashed_password": get_password_hash("password123")
                })
                print("🔒 Mot de passe 'emma_moreau' réinitialisé")
    except Exception as e:
        print(f"⚠️ Échec initialisation utilisateurs par défaut: {e}")
    finally:
        try:
            db.close()
        except Exception:
            pass

    
    
    voice_service = VoiceService()
    await voice_service.initialize()
    
    camera_service = CameraService()
    await camera_service.initialize()
    
    ai_service = AIService()
    await ai_service.initialize()
    
    aurian_health_service = AurianHealthService()
    await aurian_health_service.initialize()
    
    aurian_voice_service = AurianVoiceService()
    await aurian_voice_service.initialize()

    # Le programme principal peut démarrer
    yield
    
    # Arrêt de tous les services
    print("🛑 Arrêt des services AurianceLumène...")
    await database_service.close()
    await voice_service.close()
    await camera_service.close()
    await ai_service.close()
    await universal_ai_service.close()
    await aurian_health_service.close()
    await aurian_voice_service.close()
    await aurian_rag_engine.close()


# Création de l'application FastAPI avec le lifespan
app = FastAPI(
    lifespan=lifespan,
    title="AurianceLumène Super App - v5.0",
    description="Plateforme santé complète et asynchrone avec Aurian Health AI.",
    version="5.0.0"
)

# Configuration CORS pour le développement
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autoriser toutes les origines pour le débuggage
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== 🩺 ROUTES AURIAN HEALTH AI ====================
@app.post("/api/aurian/health-chat")
async def aurian_health_chat(message: str):
    """Chat santé spécialisé avec Aurian (route de compatibilité)"""
    try:
        if aurian_health_service is None or not aurian_health_service.initialized:
            raise HTTPException(500, "Service Aurian Health non initialisé")
            
        response = await aurian_health_service.generate_medical_response(message)
        return {
            "user_message": message,
            "aurian_response": response,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        # NOTE: Le bloc try/except dans la fonction précédente était inutilement complexe.
        # FastAPI gère déjà les HTTPException. 
        raise HTTPException(500, detail=f"Erreur Aurian Health AI: {str(e)}")


@app.get("/api/aurian/emergency-protocols")
async def get_aurian_emergency_protocols():
    """Protocoles d'urgence Aurian (route de compatibilité)"""
    return {
        "urgences_vitales": {
            "arrêt_cardiorespiratoire": "15 + Massage cardiaque + DAE",
            "AVC": "15 - Visage, Bras, Parole - Urgence absolue",
            "détresse_respiratoire": "15 - Ne pas allonger",
            "hémorragie": "15 + Compression directe",
            "brûlures_graves": "15 + Refroidissement à l'eau"
        },
        "numéros_urgence": {
            "SAMU": "15",
            "Pompiers": "18", 
            "Urgence_européenne": "112",
            "SOS_Médecins": "36 24"
        }
    }

# ==================== 🎤 ROUTES VOCALES AURIAN ====================
# Note: Ces routes sont définies dans auriance_routes.py
# @app.post("/api/aurian/voice/transcribe-medical", response_model=None)
# async def transcribe_medical_audio(file: UploadFile = File(...)):
#     """Transcription audio spécialisée santé Aurian"""
#     if aurian_voice_service is None or not aurian_voice_service.initialized:
#         raise HTTPException(500, "Service Aurian Voice non initialisé")
#     # Utilisation d'un placeholder pour le fichier si les dépendances n'existent pas
#     if not HAS_COMPLEX_IMPORTS and isinstance(file, PlaceholderFile):
#          return await aurian_voice_service.transcribe_medical_audio(file)
#     # L'appel à await file.read() bloque, doit être fait dans un Executor, mais 
#     # pour cet exemple, on simule l'opération dans le service.
#     return await aurian_voice_service.transcribe_medical_audio(file)


@app.post("/api/aurian/voice/speak-medical")
async def speak_medical_text(text: str):
    """Synthèse vocale pour texte médical Aurian"""
    if aurian_voice_service is None or not aurian_voice_service.initialized:
        raise HTTPException(500, "Service Aurian Voice non initialisé")
    await aurian_voice_service.speak_medical_response(text)
    return {"status": "spoken", "medical_text": text, "language": "fr"}

# ==================== 🎤 ROUTES VOCALES BASIQUES ====================
# Note: Ces routes sont définies dans voice_recognition_routes.py
# @app.post("/api/voice/transcribe", response_model=None)
# async def transcribe_audio(file: UploadFile = File(...)):
#     """Transcription audio"""
#     if voice_service is None or not voice_service.initialized:
#         raise HTTPException(500, "Service vocal non initialisé")
#     return await voice_service.transcribe_audio(file)

@app.post("/api/voice/speak")
async def text_to_speech(text: str):
    """Synthèse vocale"""
    if voice_service is None or not voice_service.initialized:
        raise HTTPException(500, "Service vocal non initialisé")
    await voice_service.speak_text(text)
    return {"status": "spoken", "text": text}

# ==================== 📷 ROUTES CAMÉRA (Placeholders) ====================
@app.get("/api/camera/health-tips")
async def get_camera_health_tips():
    """Simule des conseils basés sur l'analyse visuelle"""
    if camera_service is None or not camera_service.initialized:
        raise HTTPException(500, "Service Caméra non initialisé")
    await _simulate_delay(0.2)
    return {"tips": ["Améliorez votre posture (dos droit)", "Faites une pause de 20 minutes"], "source": "Camera Analysis"}

# ==================== 🧠 ROUTES IA (Placeholder du routeur) ====================

@app.get("/api/ai/chat")
async def chat_with_basic_ai(message: str):
    """Endpoint pour le chat IA Universelle (utilisé par la démo)"""
    if ai_service is None or not ai_service.initialized:
        raise HTTPException(500, "Service IA non initialisé")
    
    response = await ai_service.generate_response(message)
    return {"user_message": message, "ai_response": response, "source": "Basic AI"}

# ==================== 📊 ROUTES PATIENTS/DATA (Placeholders) ====================

@app.get("/api/patients")
async def get_all_patients():
    """Liste des patients (simulée)"""
    if database_service is None or not database_service.initialized:
        raise HTTPException(500, "Service DB non initialisé")
    await _simulate_delay(0.3)
    return [
        {"id": "P001", "nom": "Jean Dupont", "age": 75, "état": "stable"},
        {"id": "P002", "nom": "Marie Curie", "age": 42, "état": "suivi"},
    ]

@app.get("/api/habitudes")
async def get_patient_habitudes():
    """Suivi des habitudes (simulé)"""
    if database_service is None or not database_service.initialized:
        raise HTTPException(500, "Service DB non initialisé")
    await _simulate_delay(0.3)
    return [
        {"jour": "Lundi", "sommeil": "7h", "eau": "1.5L"},
        {"jour": "Mardi", "sommeil": "6h", "eau": "2.0L"},
    ]

@app.get("/api/plannings")
async def get_care_plannings():
    """Planning des soins (simulé)"""
    if database_service is None or not database_service.initialized:
        raise HTTPException(500, "Service DB non initialisé")
    await _simulate_delay(0.3)
    return [
        {"heure": "08:00", "soin": "Injection insuline", "patient": "P001"},
        {"heure": "11:30", "soin": "Contrôle tension", "patient": "P002"},
    ]

# ==================== 🌍 ROUTES GÉNÉRALES / EXTERNES ====================

@app.get("/meteo/{ville}")
async def get_meteo(ville: str):
    """Météo en temps réel (simulée)"""
    await _simulate_delay(0.2)
    return {"ville": ville, "température": 22, "condition": "Ensoleillé", "humidite": "45%"}

@app.get("/nutrition/info/{aliment}")
async def get_nutrition(aliment: str):
    """Informations nutritionnelles (simulées)"""
    await _simulate_delay(0.2)
    return {"aliment": aliment, "calories": 52, "glucides": 14, "vitamines": ["C", "A"]}

@app.get("/transport/{type_transport}")
async def get_transport(type_transport: str):
    """Informations transports (simulées)"""
    await _simulate_delay(0.2)
    return {"transport": type_transport, "infos": "Trafic normal, prochain passage dans 5 min."}

@app.get("/sante/conseils")
async def get_conseils_sante():
    """Conseils généraux de santé"""
    return {"conseils": ["Buvez de l'eau", "Mangez équilibré", "Dormez bien"]}

# ==================== 🔧 API GÉNÉRALES ====================
@app.get("/")
def root():
    """Route d'accueil principale"""
    return {
        "message": "🚀 AurianceLumène Super App - Version 5.0 avec Aurian Health AI",
        "version": "5.0.0", 
        "description": "Plateforme santé complète avec Aurian Health AI, IA vocale médicale, et toutes les API intégrées",
        "api_disponibles": [
            "🔐 /auth/* - Authentification (omise)",
            "🏥 /sante/* - Santé et conseils", 
            "🎤 /api/voice/* - Reconnaissance vocale",
            "🧬 /api/aurian/* - Aurian Health AI",
            "🎤 /api/aurian/voice/* - Vocal médical Aurian",
            "📷 /api/camera/* - Analyse caméra", 
            "🧠 /api/ai/chat - IA Universelle",
            "👥 /api/patients - Gestion patients",
            "📝 /api/habitudes - Suivi habitudes",
            "📅 /api/plannings - Planning soins",
            "🌤️ /meteo/* - Météo en temps réel", 
            "🍎 /nutrition/* - Informations nutritionnelles",
            "🚌 /transport/* - Infos transports",
            "🆕 /api/v2/aurian/chat - NOUVEAU: Aurian Unifié v2.0"  
        ]
    }

@app.get("/health")
def health_check():
    """Vérification de l'état des services"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "database": "✅" if database_service and database_service.initialized else "❌",
            "voice": "✅" if voice_service and voice_service.initialized else "❌", 
            "camera": "✅" if camera_service and camera_service.initialized else "❌",
            "ai": "✅" if ai_service and ai_service.initialized else "❌",
            "universal_ai": "✅" if universal_ai_service and universal_ai_service.initialized else "❌",
            "rag_engine": "✅" if aurian_rag_engine and aurian_rag_engine.initialized else "❌",
            "aurian_health_ai": "✅" if aurian_health_service and aurian_health_service.initialized else "❌",
            "aurian_voice": "✅" if aurian_voice_service and aurian_voice_service.initialized else "❌"
        }
    }


# ==================== 🆕 NOUVELLES ROUTES AURIAN UNIFIÉES (CONSERVÉES) ====================

@app.get("/api/v2/aurian/chat")
async def aurian_master_chat_get(message: str, language: str = "fr"):
    """Endpoint principal avec tous les services (Chatbot Unifié) - GET pour la démo"""
    if universal_ai_service is None or not universal_ai_service.initialized:
        raise HTTPException(500, "Service Aurian Unifié non initialisé")
    
    response = await universal_ai_service.generate_response(message)
    
    return {
        "user_message": message,
        "aurian_response": response,
        "language": language,
        "timestamp": datetime.now().isoformat(),
        "source": "Aurian Master (Universal AI Fallback)"
    }


# La version POST est conservée pour la compatibilité avec votre structure JSON
@app.post("/api/v2/aurian/chat")
async def aurian_master_chat_post(request: Dict[str, Any]):
    """Endpoint principal avec tous les services (Chatbot Unifié) - POST"""
    try:
        message = request.get("message", "")
        language = request.get("language", "fr")
        
        if not message:
            raise HTTPException(400, "Message requis")
            
        if universal_ai_service is None or not universal_ai_service.initialized:
            raise HTTPException(500, "Service Aurian Unifié non initialisé")

        response = await universal_ai_service.generate_response(message)
        
        return {
            "user_message": message,
            "aurian_response": response,
            "language": language,
            "timestamp": datetime.now().isoformat(),
            "source": "Aurian Master (Universal AI Fallback)"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Erreur Aurian Master: {str(e)}")


# ==================== ⚡ WEBSOCKET ====================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "chat" and ai_service:
                # Utilise le service IA basique pour la démo WebSocket
                response = await ai_service.generate_response(message["text"]) 
                await websocket.send_text(json.dumps({
                    "type": "ai_response",
                    "text": response
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        # Affichage de l'erreur dans la console du serveur
        print(f"Erreur WebSocket: {e}")

# ==================== 📱 INTERFACE ====================
@app.get("/demo", response_class=HTMLResponse)
def demo_interface():
    """
    Interface de démonstration HTML complète avec tous les boutons d'API.
    Note : Le JS est inclus dans la fonction pour la simplicité du fichier unique.
    """
    js_client_functions = """
        async function getNutrition() {
            const aliment = document.getElementById('aliment').value || 'pomme';
            const response = await fetch('/nutrition/info/' + aliment);
            const data = await response.json();
            displayResults('Nutrition ' + aliment, data);
        }
        async function universalAIChat() {
            const message = document.getElementById('universal-message').value;
            // Appel à l'endpoint Aurian Unifié v2 (GET)
            const response = await fetch('/api/v2/aurian/chat?message=' + encodeURIComponent(message));
            const data = await response.json();
            displayResults('IA Universelle Aurian', data);
        }
        
        async function testAurianVoice() {
            // Simule une demande d'IA en lien avec le vocal
            const response = await fetch('/api/v2/aurian/chat?message=' + encodeURIComponent("Bonjour Aurian, j'ai une question sur la nutrition diabétique"));
            const data = await response.json();
            displayResults('Test IA Universelle (Vocal Simulé)', data);
        }
        
        async function getEmergencyProtocols() {
            const response = await fetch('/api/aurian/emergency-protocols');
            const data = await response.json();
            displayResults('Protocoles Urgence Aurian', data);
        }
        
        async function testEmergency() {
            // Teste la détection d'urgence dans l'IA Universelle
            const response = await fetch('/api/v2/aurian/chat?message=' + encodeURIComponent("J'ai une douleur thoracique intense, aidez-moi !"));
            const data = await response.json();
            displayResults('Test Urgence IA Universelle', data);
        }
        
        async function getPatients() {
            const response = await fetch('/api/patients');
            const data = await response.json();
            displayResults('Patients', data);
        }
        
        async function getHabitudes() {
            const response = await fetch('/api/habitudes');
            const data = await response.json();
            displayResults('Habitudes', data);
        }
        
        async function getPlannings() {
            const response = await fetch('/api/plannings');
            const data = await response.json();
            displayResults('Planning', data);
        }
        
        async function chatWithAI() {
            const message = document.getElementById('message').value;
            // Utilise le service IA basique (ai_router)
            const response = await fetch('/api/ai/chat?message=' + encodeURIComponent(message)); 
            const data = await response.json();
            displayResults('IA Basique', data);
        }
        
        async function testVoice() {
            // Utilise le service AI basique pour générer la réponse à "Bonjour, test vocal"
            const response = await fetch('/api/ai/chat?message=' + encodeURIComponent("Bonjour, test vocal"));
            const data = await response.json();
            displayResults('Test Vocal', data);
        }
        
        async function getCameraTips() {
            const response = await fetch('/api/camera/health-tips');
            const data = await response.json();
            displayResults('Conseils Caméra', data);
        }
        
        async function getMeteo() {
            const ville = document.getElementById('ville').value || 'Paris';
            const response = await fetch('/meteo/' + ville);
            const data = await response.json();
            displayResults('Météo ' + ville, data);
        }
        
        async function getTransport(type) {
            const response = await fetch('/transport/' + type);
            const data = await response.json();
            displayResults('Transport ' + type, data);
        }
        
        function displayResults(title, data) {
            document.getElementById('results').innerHTML = `
                <h3>${title}</h3>
                <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow: auto; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
            `;
        }
    """
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AurianceLumène - Interface Complète avec Aurian Health AI</title>
        <style>
            body {{ font-family: 'Inter', sans-serif; margin: 40px; background: #f0f2f5; }}
            .container {{ max-width: 1200px; margin: 0 auto; }}
            .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }}
            .card {{ background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
            .btn {{ background: #007bff; color: white; padding: 12px 20px; border: none; border-radius: 8px; margin: 5px; cursor: pointer; transition: background 0.3s; }}
            .btn:hover {{ background: #0056b3; }}
            .btn-aurian {{ background: #28a745; }}
            .btn-aurian:hover {{ background: #218838; }}
            .section {{ margin-bottom: 30px; }}
            .aurian-section {{ border-left: 4px solid #28a745; padding-left: 15px; background: #e6ffe6; border-radius: 15px; padding: 20px; }}
            input[type="text"] {{ border: 1px solid #ccc; border-radius: 8px; }}
        </style>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
        <div class="container">
            <h1>🚀 AurianceLumène - Toutes les API + Aurian Health AI</h1>
            <p>Plateforme santé complète intégrant Aurian Health AI et reconnaissance vocale médicale</p>
            
            <div class="section aurian-section">
                <h2>🧬 IA UNIVERSELLE AURIAN (NOUVEAU)</h2>
                <div class="grid">
                    <div class="card">
                        <h3>🏥 Chat Santé Intelligent</h3>
                        <input type="text" id="universal-message" placeholder="Votre question santé..." style="width: 100%; padding: 10px; margin: 10px 0;">
                        <button class="btn btn-aurian" onclick="universalAIChat()">Demander à l'IA Universelle</button>
                    </div>
                    
                    <div class="card">
                        <h3>🎤 Vocal Médical</h3>
                        <button class="btn btn-aurian" onclick="testAurianVoice()">Test Vocal Aurian (Simulé)</button>
                        <button class="btn btn-aurian" onclick="getEmergencyProtocols()">Protocoles Urgence</button>
                    </div>
                    
                    <div class="card">
                        <h3>🚨 Urgences</h3>
                        <button class="btn btn-aurian" onclick="testEmergency()">Test Détection Urgence</button>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>📊 Données Patients</h2>
                <div class="grid">
                    <div class="card">
                        <h3>👥 Patients</h3>
                        <button class="btn" onclick="getPatients()">Liste Patients</button>
                    </div>
                    
                    <div class="card">
                        <h3>📝 Habitudes</h3>
                        <button class="btn" onclick="getHabitudes()">Liste Habitudes</button>
                    </div>
                    
                    <div class="card">
                        <h3>📅 Planning</h3>
                        <button class="btn" onclick="getPlannings()">Liste Planning</button>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🤖 Intelligence Artificielle</h2>
                <div class="grid">
                    <div class="card">
                        <h3>🧠 Chat IA Universelle</h3>
                        <input type="text" id="message" placeholder="Votre message..." style="width: 100%; padding: 10px; margin: 10px 0;">
                        <button class="btn" onclick="chatWithAI()">Envoyer</button>
                    </div>
                    
                    <div class="card">
                        <h3>🎤 Vocal</h3>
                        <button class="btn" onclick="testVoice()">Test Vocal (Simulé)</button>
                    </div>
                    
                    <div class="card">
                        <h3>📷 Caméra</h3>
                        <button class="btn" onclick="getCameraTips()">Conseils Visuels</button>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🌍 Services Externes</h2>
                <div class="grid">
                    <div class="card">
                        <h3>🌤️ Météo</h3>
                        <input type="text" id="ville" placeholder="Ville..." style="width: 100%; padding: 10px; margin: 10px 0;">
                        <button class="btn" onclick="getMeteo()">Météo</button>
                    </div>
                    
                    <div class="card">
                        <h3>🍎 Nutrition</h3>
                        <input type="text" id="aliment" placeholder="Aliment..." style="width: 100%; padding: 10px; margin: 10px 0;">
                        <button class="btn" onclick="getNutrition()">Infos</button>
                    </div>
                    
                    <div class="card">
                        <h3>🚌 Transports</h3>
                        <button class="btn" onclick="getTransport('metro')">Métro</button>
                        <button class="btn" onclick="getTransport('bus')">Bus</button>
                    </div>
                </div>
            </div>
            
            <div id="results" style="margin-top: 30px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"></div>
        </div>

        <script>
            // === FONCTIONS CLIENT JS ===
            {js_client_functions} 
        </script>
    </body>
    </html>
    """

# ==================== AJOUT DES NOUVELLES ROUTES VOCALES ====================
app.include_router(voice_recognition_router)
app.include_router(auriance_router)
app.include_router(auth_router)
app.include_router(data_router)
app.include_router(users_router)
app.include_router(translation_router)

# ==================== LANCEMENT ====================
if __name__ == "__main__":
    # Assurez-vous d'avoir installé uvicorn : pip install uvicorn
    import uvicorn
    print("\n" + "="*50)
    print("🚀 Serveur Auriance complet avec Auriance Health AI démarré!")
    print("📡 http://localhost:8000")
    print("📚 Documentation: http://localhost:8000/docs")
    print("🖥️ Interface demo: http://localhost:8000/demo")
    print("="*50 + "\n")
    # Lancement d'Uvicorn avec l'application
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

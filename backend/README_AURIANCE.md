# 🎤 AURIANCE - Intelligent Voice Engine

## Vue d'ensemble

**AURIANCE** est un moteur vocal intelligent **B2B** qui transforme la parole en actions automatiques pour n'importe quel domaine d'activité.

Au lieu d'écrire ou de cliquer, l'utilisateur parle, et AURIANCE:
- ✅ **Transcrit** le discours en texte (Whisper)
- ✅ **Extrait** les informations pertinentes (NLP)
- ✅ **Rempli** automatiquement les formulaires (JSON)
- ✅ **Génère** des requêtes SQL/Cypher pour chercher dans les bases
- ✅ **Crée** des rapports structurés
- ✅ **Génère** des résumés

### Exemples de cas d'usage

#### 🏥 Secteur Médical
```
Médecin: "Patient Jean Martin, 45 ans, allergies à la pénicilline..."
→ Compte-rendu médical auto-généré
```

#### 🌿 Biodiversité
```
Naturaliste: "Observation d'un aigle royal au col de la Loze, 14h30..."
→ Fiche d'observation structurée
```

#### 📋 Administration
```
Agent: "Demande de permis pour construire à 42 rue de la Paix..."
→ Formulaire administratif auto-rempli
```

#### 🏢 Logiciels SaaS
```
Entreprise intègre AURIANCE → Clients ont reconnaissance vocale intelligente
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                       CLIENT (Mobile/Web)                 │
│                    Enregistre l'audio                      │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                   AURIANCE API (FastAPI)                  │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  1️⃣  POST /api/auriance/transcribe                        │
│      └─ Audio → Whisper → Texte                           │
│                                                            │
│  2️⃣  POST /api/auriance/transcribe-and-extract            │
│      └─ Audio → Texte + NLP → Champs extraits            │
│                                                            │
│  3️⃣  POST /api/auriance/generate-form-json               │
│      └─ Texte → Patterns → JSON formulaire               │
│                                                            │
│  4️⃣  POST /api/auriance/generate-sql-query                │
│      └─ Intention → SQL prêt à exécuter                  │
│                                                            │
│  4B️⃣ POST /api/auriance/generate-cypher-query             │
│      └─ Intention → Cypher (Neo4j)                       │
│                                                            │
│  5️⃣  POST /api/auriance/generate-report                   │
│      └─ Texte → Rapport (JSON/MD/PDF)                    │
│                                                            │
│  6️⃣  POST /api/auriance/complete-pipeline                 │
│      └─ Audio → Tout faire en une seule requête          │
│                                                            │
└──────────────────────────────────────────────────────────┘
        │           │              │               │
        ▼           ▼              ▼               ▼
    Whisper      NLP        Patterns        Report Gen
   (OpenAI)    (Extraction)  (SQL/Cypher)   (PDF/MD)
```

---

## 📦 Installation

### Prérequis
- Python 3.8+
- pip ou conda

### 1. Cloner le repo
```bash
cd backend
```

### 2. Créer un environnement virtuel
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 3. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 4. Télécharger le modèle Whisper (première utilisation)
```bash
python -c "import whisper; whisper.load_model('base')"
```

---

## 🚀 Démarrage

### Lancer le serveur
```bash
python -m uvicorn app.main_auriance:app --reload --host 0.0.0.0 --port 8000
```

### Accéder à l'API
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 📚 Utilisation des Routes

### 1️⃣ Transcrire un audio
```bash
curl -X POST "http://localhost:8000/api/auriance/transcribe" \
  -F "audio_file=@path/to/audio.wav" \
  -F "language=fr"
```

**Réponse:**
```json
{
  "success": true,
  "transcription": "Bonjour, je m'appelle Jean, j'ai 30 ans",
  "language": "fr",
  "confidence": 0.95
}
```

---

### 2️⃣ Transcrire + Extraire les champs
```bash
curl -X POST "http://localhost:8000/api/auriance/transcribe-and-extract" \
  -F "audio_file=@consultation.wav" \
  -F "language=fr" \
  -F "fields=[\"name\", \"age\", \"email\"]"
```

**Réponse:**
```json
{
  "success": true,
  "transcription": "Je m'appelle Jean Dupont, j'ai 45 ans...",
  "extracted_fields": {
    "name": "Jean Dupont",
    "age": "45",
    "email": "jean@example.com"
  }
}
```

---

### 3️⃣ Générer JSON pour formulaires
```bash
curl -X POST "http://localhost:8000/api/auriance/generate-form-json" \
  -d "transcription=Je m'appelle Jean, j'ai 30 ans" \
  -d "form_type=generic"
```

**Réponse:**
```json
{
  "success": true,
  "form_json": {
    "type": "generic",
    "fields": {
      "name": "Jean",
      "age": "30"
    }
  }
}
```

---

### 4️⃣ Générer requête SQL
```bash
curl -X POST "http://localhost:8000/api/auriance/generate-sql-query" \
  -d "intent=Afficher tous les projets sur la biodiversité"
```

**Réponse:**
```json
{
  "success": true,
  "sql": {
    "action": "SELECT",
    "table": "projects",
    "query": "SELECT * FROM projects WHERE content LIKE '%biodiversité%'",
    "confidence": 0.80
  }
}
```

---

### 5️⃣ Générer requête Cypher (Neo4j)
```bash
curl -X POST "http://localhost:8000/api/auriance/generate-cypher-query" \
  -d "intent=Afficher les projets liés à la biodiversité"
```

**Réponse:**
```json
{
  "success": true,
  "cypher": {
    "query": "MATCH (a:Project)-[r:RELATED_TO]->(b) RETURN a, r, b",
    "confidence": 0.80
  }
}
```

---

### 6️⃣ Générer un rapport
```bash
curl -X POST "http://localhost:8000/api/auriance/generate-report" \
  -d "transcription=Patient Jean Martin, 45 ans, allergies pénicilline..." \
  -d "report_type=medical" \
  -d "format=json"
```

**Réponse:**
```json
{
  "success": true,
  "report": {
    "title": "Rapport Médical",
    "type": "medical",
    "sections": [
      {
        "name": "Patient",
        "fields": {
          "name": "Jean Martin",
          "age": "45"
        }
      }
    ],
    "raw_text": "Patient Jean Martin, 45 ans..."
  }
}
```

---

### 🚀 Pipeline complet (All-in-one)
```bash
curl -X POST "http://localhost:8000/api/auriance/complete-pipeline" \
  -F "audio_file=@consultation.wav" \
  -F "language=fr" \
  -F "action=all"
```

Fait tout d'un coup: transcription + extraction + SQL + rapport!

---

## 🔧 Configuration

### Variables d'environnement (.env)
```
# Whisper
WHISPER_MODEL=base  # tiny, base, small, medium, large
WHISPER_DEVICE=cpu  # cpu ou cuda

# Database
DATABASE_URL=postgresql://user:pass@localhost/auriance

# API
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

---

## 📊 Performance

### Temps de réponse approximatif (sur CPU)
- **Transcription (30s audio)**: ~10-15 secondes
- **Extraction NLP**: ~100ms
- **Génération SQL**: ~50ms
- **Génération rapport**: ~200ms

### Pour améliorer:
- Utiliser **GPU** (CUDA) pour Whisper
- **Cacher** les résultats avec Redis
- **Modèle réduit** (`tiny`, `base`)

---

## 📱 Intégration Mobile

### Flutter (auriance_mobile)
```dart
final response = await http.post(
  Uri.parse('http://192.168.1.100:8000/api/auriance/transcribe'),
  headers: {'Content-Type': 'multipart/form-data'},
  body: {
    'audio_file': audioBytes,
    'language': 'fr'
  }
);
```

### React Web (auriance-frontend)
```javascript
const formData = new FormData();
formData.append('audio_file', audioBlob);
formData.append('language', 'fr');

const response = await fetch('http://localhost:8000/api/auriance/transcribe', {
  method: 'POST',
  body: formData
});
```

---

## 🧪 Tests

```bash
# Test unitaire
pytest tests/

# Test d'intégration
curl http://localhost:8000/docs
```

---

## 🤝 Intégration pour les entreprises

Si votre entreprise a une application métier et veut ajouter la reconnaissance vocale intelligente:

1. **Endpoint à appeler**: `POST /api/auriance/complete-pipeline`
2. **Format entrée**: Fichier audio + language
3. **Format sortie**: JSON prêt à intégrer

Exemple (Node.js):
```javascript
const response = await fetch('https://auriance-api.com/api/auriance/complete-pipeline', {
  method: 'POST',
  body: formData
});

const data = await response.json();
// data.transcription: le texte
// data.extracted_fields: les infos extraites
// data.sql: requête SQL générable
// data.report: rapport structuré
```

---

## 📄 Licence

MIT - Libre d'utilisation

---

## 📧 Support

Pour toute question ou problème: [support@auriance.io](mailto:support@auriance.io)

---

**Made with ❤️ for voice-first applications**

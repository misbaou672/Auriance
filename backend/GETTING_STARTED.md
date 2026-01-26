# ✅ CHECKLIST DE DÉMARRAGE - AURIANCE

## 🚀 Avant de commencer (5 min)

- [ ] Python 3.8+ installé
- [ ] pip à jour
- [ ] Git clonné
- [ ] Terminal ouvert dans le dossier `/backend`

## 📦 Installation (10 min)

```bash
# 1. Créer l'environnement virtuel
python -m venv venv

# 2. Activer l'environnement
# Sur Linux/Mac:
source venv/bin/activate
# Sur Windows:
venv\Scripts\activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Télécharger le modèle Whisper (peut prendre 5-10 min)
python -c "import whisper; whisper.load_model('base')"
```

## ⚙️ Configuration (2 min)

```bash
# Créer le fichier .env
cp .env.example .env

# Optionnel: Éditer .env pour personnaliser
# (Par défaut, tout fonctionne)
```

## 🚀 Lancer le serveur (1 min)

```bash
python -m uvicorn app.main_auriance:app --reload --host 0.0.0.0 --port 8000
```

Vous devriez voir:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

## 🌐 Vérifier que ça marche (1 min)

Ouvrez dans votre navigateur:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)
- http://localhost:8000/health (Health check)

## 🧪 Tester les endpoints (5 min)

```bash
# Dans un autre terminal
python test_auriance_api.py
```

Vous devriez voir des tests ✅ PASS pour chaque endpoint.

## 📝 Fichiers importants à lire

1. **README_AURIANCE.md** (15 min)
   - Usage détaillé
   - Exemples pratiques
   - Cas d'usage

2. **DEPLOYMENT.md** (20 min)
   - Comment déployer
   - Production, Docker, Cloud

3. **NEXT_STEPS.md** (10 min)
   - Roadmap
   - Priorités
   - Prochaines phases

## 🎯 Premiers pas avec l'API

### Test 1: Transcrire un audio
```bash
curl -X POST "http://localhost:8000/api/auriance/transcribe" \
  -F "audio_file=@your_audio.wav" \
  -F "language=fr"
```

### Test 2: Extraire des champs
```bash
curl -X POST "http://localhost:8000/api/auriance/generate-form-json" \
  -d "transcription=Je m'appelle Jean, j'ai 30 ans" \
  -d "form_type=generic"
```

### Test 3: Générer une requête SQL
```bash
curl -X POST "http://localhost:8000/api/auriance/generate-sql-query" \
  -d "intent=Afficher tous les projets sur la biodiversité"
```

## 🔍 Dépannage rapide

| Problème | Solution |
|----------|----------|
| `ModuleNotFoundError: whisper` | `pip install openai-whisper` |
| `Connection refused` | Vérifier que le serveur est lancé sur :8000 |
| `CUDA out of memory` | Éditer .env: `WHISPER_DEVICE=cpu` |
| `Port 8000 already in use` | `python -m uvicorn ... --port 8001` |

## 📊 Quoi faire maintenant?

### Immédiatement (Aujourd'hui)
1. ✅ Installer et lancer le serveur
2. ✅ Accéder à http://localhost:8000/docs
3. ✅ Tester un endpoint simple
4. ✅ Lire README_AURIANCE.md

### Cette semaine
1. ✅ Connecter la mobile app
2. ✅ Connecter la web app
3. ✅ Tester le pipeline complet
4. ✅ Valider tous les cas d'usage

### La semaine prochaine
1. ✅ Ajouter la base de données
2. ✅ Implémenter l'auth
3. ✅ Optimisations

## 🎯 Objectif: Avoir une démo fonctionnelle

**But final**: Montrer le pipeline complet:
1. ✅ Enregistrer audio
2. ✅ Transcrire
3. ✅ Extraire les infos
4. ✅ Générer un rapport
5. ✅ Valider le résultat

**Cible**: Fin de la semaine

## ❓ Questions?

1. **Comment ça marche?** → README_AURIANCE.md
2. **Comment déployer?** → DEPLOYMENT.md
3. **Prochaines étapes?** → NEXT_STEPS.md
4. **Erreur?** → Check TROUBLESHOOTING section

## 📱 Intégration mobile

Quand vous êtes prêt, connecter la Flutter app:

```dart
const String API_URL = 'http://192.168.X.X:8000/api/auriance';

// Appel à /complete-pipeline
final response = await http.post(
  Uri.parse('$API_URL/complete-pipeline'),
  body: {...}
);
```

## ✨ Vous êtes prêt!

Commencez par:
```bash
python -m uvicorn app.main_auriance:app --reload
```

Puis allez à: http://localhost:8000/docs

**Good luck! 🎤✨**

---

## 📋 Checklist détaillée

### Installation
- [ ] Python 3.8+
- [ ] venv créé
- [ ] dépendances installées
- [ ] Whisper téléchargé

### Configuration
- [ ] .env créé
- [ ] Variables d'env correctes
- [ ] Port 8000 disponible

### Test
- [ ] Serveur lancé sans erreur
- [ ] /health retourne 200
- [ ] /docs accessible
- [ ] test_auriance_api.py passe

### Documentation
- [ ] README_AURIANCE.md lu
- [ ] DEPLOYMENT.md lu
- [ ] NEXT_STEPS.md lu
- [ ] Roadmap comprise

### Prêt pour la suite
- [ ] API testée et fonctionnelle
- [ ] Cas d'usage validés
- [ ] Mobile app prête à intégrer
- [ ] Web app prête à intégrer

---

**Dernière chose**: Félicitations d'avoir AURIANCE en place! 🎉

Vous avez un backend professionnel, documenté et prêt à être mis en production.

Continuez vers la Phase 2: Ajouter la base de données et l'authentification.

Let's go! 🚀

# 🚀 Guide de Déploiement - AURIANCE

## 📋 Sommaire
1. [Développement local](#développement-local)
2. [Production](#production)
3. [Docker](#docker)
4. [Cloud Deployment](#cloud-deployment)

---

## Développement local

### Installation rapide

```bash
# 1. Cloner et naviguer
cd backend

# 2. Créer l'env virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos paramètres

# 5. Télécharger le modèle Whisper (première fois)
python -c "import whisper; whisper.load_model('base')"

# 6. Lancer le serveur
python -m uvicorn app.main_auriance:app --reload --host 0.0.0.0 --port 8000
```

### Accès à l'API
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

### Tester l'API
```bash
python test_auriance_api.py
```

---

## Production

### Prérequis
- Python 3.8+
- PostgreSQL (pour la persistance)
- Redis (optionnel, pour le caching)
- GPU (optionnel, pour Whisper)

### Configuration

1. **Mettre à jour .env**
```env
DEBUG=False
WHISPER_DEVICE=cuda  # Si GPU disponible
DATABASE_URL=postgresql://user:pass@host:5432/auriance
```

2. **Installer Gunicorn** (production server)
```bash
pip install gunicorn
```

3. **Lancer avec Gunicorn**
```bash
gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  app.main_auriance:app
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name auriance-api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts pour les uploads audio
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

### SSL/HTTPS (Let's Encrypt)
```bash
sudo certbot certonly --standalone -d auriance-api.example.com
# Copier les certificats dans Nginx config
```

---

## Docker

### Dockerfile
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copier les requirements et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Télécharger le modèle Whisper
RUN python -c "import whisper; whisper.load_model('base')"

# Copier l'application
COPY app ./app

# Port
EXPOSE 8000

# Lancer
CMD ["uvicorn", "app.main_auriance:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://auriance:password@db:5432/auriance
      - REDIS_URL=redis://redis:6379
      - WHISPER_MODEL=base
      - WHISPER_DEVICE=cpu
    depends_on:
      - db
      - redis
    volumes:
      - ./app:/app/app

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: auriance
      POSTGRES_PASSWORD: password
      POSTGRES_DB: auriance
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # (Optionnel) Adminer pour gérer la DB
  adminer:
    image: adminer
    ports:
      - "8080:8080"

volumes:
  db_data:
  redis_data:
```

### Lancer avec Docker
```bash
docker-compose up -d

# Logs
docker-compose logs -f api

# Arrêter
docker-compose down
```

---

## Cloud Deployment

### Heroku

```bash
# 1. Installer Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# 2. Login et créer app
heroku login
heroku create auriance-api

# 3. Configurer les variables
heroku config:set DEBUG=False
heroku config:set DATABASE_URL=...

# 4. Créer Procfile
echo "web: gunicorn --worker-class uvicorn.workers.UvicornWorker app.main_auriance:app" > Procfile

# 5. Déployer
git push heroku main
```

### AWS (EC2 + RDS)

```bash
# 1. Lancer une instance EC2 (Ubuntu 22.04)
# 2. Se connecter et cloner le repo
git clone <repo>
cd backend

# 3. Installer les dépendances
sudo apt-get update
sudo apt-get install python3-pip python3-venv ffmpeg libsndfile1
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Configurer avec .env
cp .env.example .env
# Éditer avec RDS database URL

# 5. Créer systemd service
sudo vim /etc/systemd/system/auriance.service
```

Contenu du service:
```ini
[Unit]
Description=AURIANCE API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/auriance/backend
Environment="PATH=/home/ubuntu/auriance/backend/venv/bin"
ExecStart=/home/ubuntu/auriance/backend/venv/bin/gunicorn \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    app.main_auriance:app

[Install]
WantedBy=multi-user.target
```

```bash
# 6. Démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable auriance
sudo systemctl start auriance
sudo systemctl status auriance
```

### Google Cloud (Cloud Run)

```bash
# 1. Configurer gcloud
gcloud auth login
gcloud config set project auriance-project

# 2. Build et push l'image
gcloud builds submit --tag gcr.io/auriance-project/auriance-api

# 3. Déployer
gcloud run deploy auriance-api \
  --image gcr.io/auriance-project/auriance-api \
  --platform managed \
  --region europe-west1 \
  --memory 4Gi \
  --timeout 3600s \
  --set-env-vars DATABASE_URL=cloudsql://...
```

### Azure (Container Instances)

```bash
# 1. Créer Container Registry
az acr create --resource-group auriance --name aurianceacr --sku Basic

# 2. Build et push
az acr build --registry aurianceacr --image auriance-api:latest .

# 3. Déployer
az container create \
  --resource-group auriance \
  --name auriance-api \
  --image aurianceacr.azurecr.io/auriance-api:latest \
  --ports 8000 \
  --environment-variables DATABASE_URL=...
```

---

## Monitoring & Logging

### Application Performance Monitoring (APM)

#### Sentry (error tracking)
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://xxxxx@sentry.io/xxxxx",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0
)
```

#### DataDog
```python
from datadog import initialize, api
from datadog.api import monitor

initialize()
```

### Logs centralisés

#### ELK Stack (Elasticsearch, Logstash, Kibana)
```python
import logging
import json
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
```

---

## Checklist de production

```
✅ Configuration
  [ ] .env configuré correctement
  [ ] SECRET_KEY changé
  [ ] DEBUG = False
  [ ] CORS_ORIGINS restreint

✅ Database
  [ ] PostgreSQL en production
  [ ] Backups automatiques configurés
  [ ] Migrations exécutées
  [ ] Indices créés

✅ Cache
  [ ] Redis configuré
  [ ] TTL défini pour les sessions
  [ ] Memory limits configurés

✅ Security
  [ ] SSL/HTTPS activé
  [ ] Firewall configuré
  [ ] Rate limiting activé
  [ ] Authentication implémentée

✅ Performance
  [ ] Whisper sur GPU (si possible)
  [ ] Compression gzip activée
  [ ] CDN pour les assets statiques
  [ ] Caching des réponses

✅ Monitoring
  [ ] Health checks en place
  [ ] Logging centralisé
  [ ] Alertes configurées
  [ ] Uptime monitoring

✅ Disaster Recovery
  [ ] Backups réguliers
  [ ] Plan de récupération
  [ ] Tests de restauration
  [ ] Documentation d'urgence
```

---

## Support

Pour l'aide au déploiement: [support@auriance.io](mailto:support@auriance.io)

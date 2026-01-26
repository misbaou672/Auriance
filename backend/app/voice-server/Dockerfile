FROM python:3.11-slim

WORKDIR /app

# Installer les dépendances système (simplifié pour Qdrant)
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copier les requirements et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY . .

## Start the Flask app
# Use the app.py entrypoint for the voice server
CMD ["python", "app.py"]


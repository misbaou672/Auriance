FROM python:3.11-slim

WORKDIR /app

# Copier les requirements et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY . .

CMD ["python", "init_qdrant.py"]

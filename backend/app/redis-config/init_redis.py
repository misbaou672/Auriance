import redis
import json

print("⚡ INITIALISATION REDIS POUR AURIANCE...")

# Connexion à Redis
r = redis.Redis(host='redis', port=6379, decode_responses=True)

# Test de connexion
try:
    r.ping()
    print("✅ CONNEXION REDIS RÉUSSIE")
except:
    print("❌ ERREUR CONNEXION REDIS")
    exit(1)

# Configuration par défaut
default_config = {
    "cache_transcriptions_ttl": 3600,
    "session_timeout": 7200, 
    "max_audio_size": 10485760,
    "max_concurrent_transcriptions": 5
}

# Stocker la configuration
r.hset("auriance:config", mapping=default_config)

print("✅ CONFIGURATION REDIS INITIALISÉE")
print("🎉 REDIS AURIANCE PRÊT !")
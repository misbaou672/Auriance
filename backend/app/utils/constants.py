# =============================================================================
# CONSTANTES DE L'APPLICATION AURIANCE - MISTRAL
# =============================================================================

# Configuration JWT
JWT_CONFIG = {
    'EXPIRATION_HOURS': 24,
    'ALGORITHM': 'HS256',
    'ISSUER': 'auriance-backend'
}

# Rôles utilisateurs
USER_ROLES = {
    'ADMIN': 'admin',
    'USER': 'user',
    'PATIENT': 'patient',
    'DOCTOR': 'doctor',
    'ASSISTANT': 'assistant'
}

# Statuts des requêtes
STATUS = {
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'COMPLETED': 'completed',
    'FAILED': 'failed',
    'CANCELLED': 'cancelled'
}

# Types de services Aurian
AURIAN_SERVICES = {
    'VOICE': 'voice',
    'HEALTH': 'health',
    'PLANNING': 'planning',
    'KNOWLEDGE': 'knowledge',
    'CAMERA': 'camera',
    'AI_CHAT': 'ai_chat'
}

# Codes de réponse HTTP
HTTP_CODES = {
    'SUCCESS': 200,
    'CREATED': 201,
    'BAD_REQUEST': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'SERVER_ERROR': 500,
    'SERVICE_UNAVAILABLE': 503
}

# Messages d'erreur standardisés
ERROR_MESSAGES = {
    'UNAUTHORIZED': 'Authentification requise',
    'FORBIDDEN': 'Accès non autorisé',
    'NOT_FOUND': 'Ressource non trouvée',
    'SERVER_ERROR': 'Erreur interne du serveur',
    'INVALID_INPUT': 'Données d\'entrée invalides',
    'MISSING_TOKEN': 'Token d\'authentification manquant',
    'INVALID_TOKEN': 'Token d\'authentification invalide',
    'EXPIRED_TOKEN': 'Token d\'authentification expiré',
    'MISTRAL_ERROR': 'Erreur du service Mistral AI'
}

# Messages de succès
SUCCESS_MESSAGES = {
    'CREATED': 'Création réussie',
    'UPDATED': 'Mise à jour réussie',
    'DELETED': 'Suppression réussie',
    'RETRIEVED': 'Récupération réussie'
}

# Limites de l'application
APP_LIMITS = {
    'MAX_FILE_SIZE': 16 * 1024 * 1024,  # 16MB
    'MAX_REQUEST_SIZE': 16 * 1024 * 1024,  # 16MB
    'MAX_ITEMS_PER_PAGE': 100,
    'DEFAULT_ITEMS_PER_PAGE': 20
}

# Configuration des modèles Mistral AI
AI_MODELS = {
    'DEFAULT_LLM': 'mistral-large-latest',  # Mistral Large
    'FAST_LLM': 'mistral-small-latest',     # Mistral Small pour rapidité
    'CODING_LLM': 'codestral-latest',       # Codestral pour le code
    'EMBEDDING_MODEL': 'mistral-embed',     # Modèle d'embedding
    'VOICE_MODEL': 'whisper-1',             # Whisper pour la voix (gardé)
    'VISION_MODEL': 'mistral-large-latest'  # Mistral gère aussi les images
}

# URLs de base des APIs externes
EXTERNAL_APIS = {
    'MISTRAL_BASE_URL': 'https://api.mistral.ai/v1',
    'OPENAI_BASE_URL': 'https://api.openai.com/v1',  # Gardé pour Whisper
    'HEALTH_API_BASE_URL': 'https://api.sante.gouv.fr/v1',
    'WEATHER_API_BASE_URL': 'https://api.meteo.fr/v1'
}

# Constantes Mistral spécifiques
MISTRAL_CONFIG = {
    'MAX_TOKENS': 32000,
    'TEMPERATURE': 0.7,
    'TOP_P': 0.9,
    'TIMEOUT': 30,
    'MAX_RETRIES': 3
}

# Types de contenu
CONTENT_TYPES = {
    'JSON': 'application/json',
    'FORM_DATA': 'multipart/form-data',
    'AUDIO': 'audio/wav',
    'IMAGE': 'image/jpeg'
}

# Environnements
ENVIRONMENTS = {
    'DEVELOPMENT': 'development',
    'PRODUCTION': 'production',
    'TESTING': 'testing'
}

# Constantes de base de données
DATABASE = {
    'MAX_POOL_SIZE': 10,
    'TIMEOUT': 30,
    'RETRY_ATTEMPTS': 3
}
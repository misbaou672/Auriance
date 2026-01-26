# services/constants.py
# =============================================================================
# CONSTANTES POUR LES SERVICES AURIANCE
# =============================================================================

# Configuration des modèles Mistral AI
AI_MODELS = {
    'DEFAULT_LLM': 'mistral-large-latest',
    'FAST_LLM': 'mistral-small-latest',
    'CODING_LLM': 'codestral-latest',
    'EMBEDDING_MODEL': 'mistral-embed',
    'VOICE_MODEL': 'whisper-1',
    'VISION_MODEL': 'mistral-large-latest'
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

# Configuration Mistral
MISTRAL_CONFIG = {
    'MAX_TOKENS': 32000,
    'TEMPERATURE': 0.7,
    'TOP_P': 0.9,
    'TIMEOUT': 30,
    'MAX_RETRIES': 3
}

# URLs des APIs externes
EXTERNAL_APIS = {
    'MISTRAL_BASE_URL': 'https://api.mistral.ai/v1',
    'OPENAI_BASE_URL': 'https://api.openai.com/v1',
}
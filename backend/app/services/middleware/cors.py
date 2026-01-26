from flask import Flask
from functools import wraps
from flask import request, make_response
import os

def setup_cors(app: Flask):
    """Configurer CORS pour l'application Flask"""
    
    @app.after_request
    def after_request(response):
        """Ajouter les headers CORS à chaque réponse"""
        origin = request.headers.get('Origin', '*')
        
        # Liste des origines autorisées
        allowed_origins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000', 
            'https://auriance.com',
            'https://app.auriance.com'
        ]
        
        # Vérifier si l'origine est autorisée
        if origin in allowed_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
        else:
            # En développement, autoriser toutes les origines
            if os.getenv('FLASK_ENV') == 'development':
                response.headers.add('Access-Control-Allow-Origin', '*')
        
        # Headers CORS standards
        response.headers.add('Access-Control-Allow-Headers', 
                           'Content-Type, Authorization, X-Requested-With, X-API-Key')
        response.headers.add('Access-Control-Allow-Methods', 
                           'GET, POST, PUT, DELETE, OPTIONS, PATCH')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Max-Age', '86400')  # 24 heures
        
        return response
    
    @app.before_request
    def handle_preflight():
        """Gérer les requêtes OPTIONS (preflight)"""
        if request.method == 'OPTIONS':
            response = make_response()
            response.headers.add('Access-Control-Allow-Headers', 
                               'Content-Type, Authorization, X-Requested-With, X-API-Key')
            response.headers.add('Access-Control-Allow-Methods', 
                               'GET, POST, PUT, DELETE, OPTIONS, PATCH')
            return response

def cors_headers(f):
    """Décorateur pour ajouter des headers CORS spécifiques à une route"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = f(*args, **kwargs)
        
        # S'assurer que c'est une réponse Flask
        if not hasattr(response, 'headers'):
            response = make_response(response)
        
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        
        return response
    return decorated_function
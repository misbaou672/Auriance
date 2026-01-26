from functools import wraps
from flask import request, jsonify, current_app
import jwt
from datetime import datetime, timedelta
import os

def token_required(f):
    """Décorateur pour protéger les routes avec JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Vérifier le token dans le header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Format: Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token format invalide'}), 401
        
        if not token:
            return jsonify({'message': 'Token manquant'}), 401
        
        try:
            # Décoder le token
            secret_key = current_app.config.get('JWT_SECRET_KEY', os.getenv('JWT_SECRET_KEY', 'fallback-secret-key'))
            data = jwt.decode(token, secret_key, algorithms=['HS256'])
            current_user = {
                'user_id': data['user_id'],
                'email': data['email'],
                'role': data.get('role', 'user')
            }
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token invalide'}), 401
        except Exception as e:
            return jsonify({'message': f'Erreur d\'authentification: {str(e)}'}), 401
        
        # Ajouter l'utilisateur au contexte de la requête
        request.current_user = current_user
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """Décorateur pour restreindre l'accès aux administrateurs"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'current_user'):
            return jsonify({'message': 'Authentification requise'}), 401
        
        if request.current_user.get('role') != 'admin':
            return jsonify({'message': 'Accès réservé aux administrateurs'}), 403
        
        return f(*args, **kwargs)
    return decorated

def generate_token(user_id, email, role='user', expires_hours=24):
    """Générer un token JWT"""
    secret_key = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
    expiration = datetime.utcnow() + timedelta(hours=expires_hours)
    
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': expiration
    }
    
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token

def get_current_user():
    """Récupérer l'utilisateur courant depuis la requête"""
    return getattr(request, 'current_user', None)
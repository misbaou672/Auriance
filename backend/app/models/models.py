# backend/app/models/models.py
from app.models.user import User
from app.models.consent import Consent
from app.models.habitude import Habitude
from app.models.content_source import ContentSource

# Fonction utilitaire d'initialisation (optionnelle)
def create_initial_seeds(session):
    sources = [
        ContentSource(name="WHO Guidelines", url="https://www.who.int"),
        ContentSource(name="Public Health France", url="https://www.santepubliquefrance.fr")
    ]
    session.add_all(sources)
    user = User(email="test@example.com", hashed_password="hashed_password_test")
    session.add(user)
    session.commit()
    consent = Consent(user_id=user.id, consent_type="general")
    session.add(consent)
    session.commit()

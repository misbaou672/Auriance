from sqlalchemy import create_engine
from app.db.base import Base
from app.models.user import User
from app.models.habitude import Habitude
from app.models.consent import Consent
from app.models.recommendation import Recommendation
from app.models.patient import Patient
from app.models.planning import Planning
from app.models.user_resource import UserResource
from app.models.query import Query
from app.models.rdv import RDV
from app.models.notification import Notification # type: ignore
from app.models.audit_log import AuditLog # type: ignore

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:110603@localhost:5432/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables créées avec succès ✅")

if __name__ == "__main__":
    create_tables()

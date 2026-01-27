"""Database session and connection"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import DATABASE_URL
from app.db.base import Base

# Import all models so SQLAlchemy knows about them
from app.models.user import User
from app.db.models import Transcription, Extraction, Report, GeneratedQuery, SQLQuery, CypherQuery, MedicalSearch

# Create engine with SQLite support
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL logging
    pool_pre_ping=True,  # Verify connections before using
    connect_args=connect_args
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - create all tables (tolérant si la base n'est pas accessible)"""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        import logging
        logging.warning(f"Impossible d'initialiser la base : {e}")


def drop_db():
    """Drop all tables (careful!)"""
    Base.metadata.drop_all(bind=engine)

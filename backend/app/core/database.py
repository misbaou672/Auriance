# app/core/database.py
import psycopg2
from psycopg2.extras import RealDictCursor
from app.core.settings import settings
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

# Ajout SQLAlchemy pour compatibilité
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db_connection():
    """Connexion à la base de données Auriance"""
    try:
        conn = psycopg2.connect(
            settings.DATABASE_URL,
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        logger.error(f"❌ Erreur connexion BD Auriance: {e}")
        return None

def init_database():
    """Initialise les tables si elles n'existent pas"""
    conn = get_db_connection()
    if not conn:
        return False
        
    try:
        with conn.cursor() as cur:
            # Table des médecins
            cur.execute("""
                CREATE TABLE IF NOT EXISTS medecins (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    prenom VARCHAR(100),
                    nom VARCHAR(100),
                    specialite VARCHAR(100),
                    numero_rpps VARCHAR(50) UNIQUE,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Table des patients
            cur.execute("""
                CREATE TABLE IF NOT EXISTS patients (
                    id SERIAL PRIMARY KEY,
                    medecin_id INTEGER REFERENCES medecins(id),
                    prenom VARCHAR(100) NOT NULL,
                    nom VARCHAR(100) NOT NULL,
                    date_naissance DATE,
                    genre VARCHAR(10),
                    numero_secu VARCHAR(15),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Table des consultations
            cur.execute("""
                CREATE TABLE IF NOT EXISTS consultations (
                    id SERIAL PRIMARY KEY,
                    medecin_id INTEGER REFERENCES medecins(id),
                    patient_id INTEGER REFERENCES patients(id),
                    date_consultation TIMESTAMP DEFAULT NOW(),
                    transcription_audio TEXT,
                    notes_medicales TEXT,
                    codes_cim TEXT[],
                    statut VARCHAR(50) DEFAULT 'brouillon',
                    duree_seconds INTEGER,
                    langue_detectee VARCHAR(10),
                    confiance_transcription FLOAT,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            conn.commit()
            logger.info("✅ Tables Auriance créées/validées")
            return True
            
    except Exception as e:
        logger.error(f"❌ Erreur initialisation BD: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()
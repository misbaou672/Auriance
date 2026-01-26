"""CRUD operations for transcriptions and extractions"""
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.models import Transcription, Extraction
from app.schemas import TranscriptionCreate, ExtractionCreate


# ===== TRANSCRIPTION CRUD =====
def create_transcription(db: Session, transcription: TranscriptionCreate, user_id: int) -> Transcription:
    """Create a new transcription"""
    db_transcription = Transcription(
        user_id=user_id,
        text=transcription.text,
        language=transcription.language,
        audio_file_path=transcription.audio_file_path,
        duration_seconds=transcription.duration_seconds,
        confidence_score=transcription.confidence_score,
        type=transcription.type
    )
    db.add(db_transcription)
    db.commit()
    db.refresh(db_transcription)
    return db_transcription


def get_transcription(db: Session, transcription_id: int) -> Transcription:
    """Get transcription by ID"""
    return db.query(Transcription).filter(Transcription.id == transcription_id).first()


def get_user_transcriptions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all transcriptions for a user"""
    return db.query(Transcription).filter(Transcription.user_id == user_id).offset(skip).limit(limit).all()


def delete_transcription(db: Session, transcription_id: int) -> bool:
    """Delete transcription"""
    db_transcription = get_transcription(db, transcription_id)
    if db_transcription:
        db.delete(db_transcription)
        db.commit()
        return True
    return False


# ===== EXTRACTION CRUD =====
def create_extraction(db: Session, extraction: ExtractionCreate, user_id: int) -> Extraction:
    """Create a new extraction"""
    db_extraction = Extraction(
        transcription_id=extraction.transcription_id,
        user_id=user_id,
        full_name=extraction.full_name,
        email=extraction.email,
        phone=extraction.phone,
        date_of_birth=extraction.date_of_birth,
        address=extraction.address,
        age=extraction.age,
        extra_fields=extraction.extra_fields,
        form_type=extraction.form_type,
        type=extraction.type  # Ajout du champ type
    )
    db.add(db_extraction)
    db.commit()
    db.refresh(db_extraction)
    return db_extraction


def get_extraction(db: Session, extraction_id: int) -> Extraction:
    """Get extraction by ID"""
    return db.query(Extraction).filter(Extraction.id == extraction_id).first()


def get_extraction_by_transcription(db: Session, transcription_id: int) -> Extraction:
    """Get extraction for a transcription"""
    return db.query(Extraction).filter(Extraction.transcription_id == transcription_id).first()


def get_user_extractions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all extractions for a user"""
    return db.query(Extraction).filter(Extraction.user_id == user_id).offset(skip).limit(limit).all()


def update_extraction(db: Session, extraction_id: int, extraction_update: dict) -> Extraction:
    """Update extraction data"""
    db_extraction = get_extraction(db, extraction_id)
    if db_extraction:
        for key, value in extraction_update.items():
            if value is not None:
                setattr(db_extraction, key, value)
        db_extraction.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_extraction)
    return db_extraction


def delete_extraction(db: Session, extraction_id: int) -> bool:
    """Delete extraction"""
    db_extraction = get_extraction(db, extraction_id)
    if db_extraction:
        db.delete(db_extraction)
        db.commit()
        return True
    return False

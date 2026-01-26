from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    medecin_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Assuming user is medecin
    
    date = Column(DateTime, default=datetime.utcnow)
    
    transcription = Column(Text, nullable=True)
    
    # Structured Data
    symptomes = Column(Text, nullable=True)
    diagnostic = Column(Text, nullable=True)
    traitement = Column(Text, nullable=True)
    
    # Snapshot fields (in case patient changes)
    nom_snapshot = Column(String, nullable=True)
    prenom_snapshot = Column(String, nullable=True)
    age_snapshot = Column(Integer, nullable=True)
    genre_snapshot = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="consultations")
    # Temporarily commented out - User.consultations is also commented
    # medecin = relationship("User", back_populates="consultations")

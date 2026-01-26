# app/models/patient.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column("nom", String)
    age = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Temporarily commented out - User.patients is also commented
    # user = relationship("User", back_populates="patients")
    consultations = relationship("Consultation", back_populates="patient")

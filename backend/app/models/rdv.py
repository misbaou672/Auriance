# app/models/rdv.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class RDV(Base):
    __tablename__ = "rdvs"

    id = Column(Integer, primary_key=True, index=True)
    infermier_id = Column(Integer, ForeignKey("users.id"))
    patient_name = Column(String)
    date = Column(DateTime, nullable=False)
    type_soin = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    infermier = relationship("User", back_populates="rdvs")

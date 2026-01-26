# app/models/consent.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    consent_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Temporarily commented out - User.consents is also commented
    # user = relationship("User", back_populates="consents")

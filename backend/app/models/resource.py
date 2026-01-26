# app/models/resource.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    url = Column(String)
    type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
# Dans Resource si tu veux lier aux users
    user_resources = relationship("UserResource", back_populates="resource")
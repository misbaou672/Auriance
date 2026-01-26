# app/models/user_resource.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class UserResource(Base):
    __tablename__ = "user_resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    url = Column(String)
    type = Column(String)  # article, pdf, video...
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resources")
    # Si tu veux lier à Resource
    resource_id = Column(Integer, ForeignKey("resources.id"))
    resource = relationship("Resource", back_populates="user_resources")

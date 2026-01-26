# app/models/content_source.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base

class ContentSource(Base):
    __tablename__ = "content_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)       # ex: "WHO Guidelines"
    url = Column(String, nullable=True)         # lien vers la source
    last_verified = Column(DateTime)

    suggestions = relationship("Suggestion", back_populates="source")

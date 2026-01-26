# app/models/planning.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Planning(Base):
    __tablename__ = "plannings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, nullable=False)
    task = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Temporarily commented out - User.plannings is also commented
    # user = relationship("User", back_populates="plannings")

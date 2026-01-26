# app/models/audit_log.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # ex: "création compte", "modification habitude"
    details = Column(String, nullable=True)  # détails supplémentaires sur l'action
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relation avec l'utilisateur
    user = relationship("User", back_populates="audit_logs")

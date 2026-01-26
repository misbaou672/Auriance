# app/models/agent.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base

class AgentIA(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

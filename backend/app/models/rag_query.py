"""Modèle SQLAlchemy pour l'historique RAG."""
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.db.base import Base


class RagQuery(Base):
    __tablename__ = "rag_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # Pour tracker par utilisateur
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    hits_count = Column(Integer, default=0)
    hits_data = Column(JSON, nullable=True)  # Stocke les hits Qdrant/Postgres/Neo4j
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<RagQuery(id={self.id}, question='{self.question[:50]}...')>"

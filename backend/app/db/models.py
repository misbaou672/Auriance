"""Database models for AURIANCE"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base





class Transcription(Base):
    """Store audio transcriptions"""
    __tablename__ = "transcriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    audio_file_path = Column(String(500))
    text = Column(Text, nullable=False)
    language = Column(String(10), default="fr")
    duration_seconds = Column(Float)  # in seconds
    confidence_score = Column(Float)  # 0-100 or 0-1
    type = Column(String(50), nullable=True)  # medical, biodiversity, construction

    # Assistant Medical fields
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    resume_ia = Column(Text, nullable=True)
    points_cles = Column(JSON, nullable=True)
    entites_detectees = Column(JSON, nullable=True)
    type_session = Column(String(50), nullable=True)  # consultation, urgence, suivi, autre
    priorite = Column(String(20), nullable=True)  # basse, normale, haute, critique
    analysee = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transcriptions")
    patient = relationship("Patient", backref="transcriptions")
    extraction = relationship("Extraction", back_populates="transcription", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="transcription", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Transcription {self.id}>"


class Extraction(Base):
    """Store extracted information from transcriptions"""
    __tablename__ = "extractions"
    
    id = Column(Integer, primary_key=True, index=True)
    transcription_id = Column(Integer, ForeignKey("transcriptions.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Extracted fields
    full_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(20))
    date_of_birth = Column(String(20))
    address = Column(Text)
    age = Column(Integer)
    
    # JSON for flexible extra data
    extra_fields = Column(JSON)
    form_type = Column(String(50))  # medical, biodiversity, administrative, etc.
    type = Column(String(50), nullable=True)  # medical, biodiversity, construction
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transcription = relationship("Transcription", back_populates="extraction")
    user = relationship("User", back_populates="extractions")
    sql_queries = relationship("SQLQuery", back_populates="extraction", cascade="all, delete-orphan")
    cypher_queries = relationship("CypherQuery", back_populates="extraction", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Extraction {self.id}>"


class SQLQuery(Base):
    """Store generated SQL queries"""
    __tablename__ = "sql_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    extraction_id = Column(Integer, ForeignKey("extractions.id"), nullable=False)
    query = Column(Text, nullable=False)
    action_type = Column(String(50))  # SELECT, INSERT, UPDATE, DELETE
    table_name = Column(String(100))
    is_executed = Column(Boolean, default=False)
    execution_result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    extraction = relationship("Extraction", back_populates="sql_queries")
    
    def __repr__(self):
        return f"<SQLQuery {self.id}>"


class CypherQuery(Base):
    """Store generated Cypher queries for Neo4j"""
    __tablename__ = "cypher_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    extraction_id = Column(Integer, ForeignKey("extractions.id"), nullable=False)
    query = Column(Text, nullable=False)
    action_type = Column(String(50))  # CREATE, MATCH, MERGE, etc.
    is_executed = Column(Boolean, default=False)
    execution_result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    extraction = relationship("Extraction", back_populates="cypher_queries")
    
    def __repr__(self):
        return f"<CypherQuery {self.id}>"


class Report(Base):
    """Store generated reports"""
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    transcription_id = Column(Integer, ForeignKey("transcriptions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String(50), nullable=False)  # medical, biodiversity, administrative, generic
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    format = Column(String(20), default="json")  # json, markdown, pdf
    file_path = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    transcription = relationship("Transcription", back_populates="reports")
    user = relationship("User", back_populates="reports")
    
    def __repr__(self):
        return f"<Report {self.id}>"


class MedicalSearch(Base):
    """Store medical search queries and results for history/export"""
    __tablename__ = "medical_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    query = Column(Text, nullable=False)
    results = Column(JSON)  # list of hits with id/score/payload
    advice = Column(JSON)   # generated general advice/suggestions
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    # not defining backref; optional user linkage

    def __repr__(self):
        return f"<MedicalSearch {self.id} '{self.query[:20] if self.query else ''}...'>"


class GeneratedQuery(Base):
    """Store AI-generated queries (SQL, Cypher, etc.)"""
    __tablename__ = "generated_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    query_text = Column(Text, nullable=False)
    query_type = Column(String(50), default="sql")  # sql, cypher, etc.
    context = Column(Text, nullable=True)  # Original context/question
    type = Column(String(50), nullable=True)  # medical, biodiversity, construction
    language = Column(String(10), default="fr-FR")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="generated_queries")
    
    def __repr__(self):
        return f"<GeneratedQuery {self.id}>"

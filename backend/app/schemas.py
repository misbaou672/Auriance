"""Pydantic schemas for API validation"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Any


# ===== USER SCHEMAS =====
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== TRANSCRIPTION SCHEMAS =====
class TranscriptionCreate(BaseModel):
    text: str
    language: str = "fr"
    audio_file_path: Optional[str] = None
    duration_seconds: Optional[float] = None
    confidence_score: Optional[float] = None
    type: Optional[str] = None  # medical, biodiversity, construction


class TranscriptionResponse(BaseModel):
    id: int
    user_id: int
    text: str
    language: str
    audio_file_path: Optional[str]
    duration_seconds: Optional[float]
    confidence_score: Optional[float]
    type: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== EXTRACTION SCHEMAS =====
class ExtractionCreate(BaseModel):
    transcription_id: Optional[int] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    extra_fields: Optional[dict] = None
    form_type: Optional[str] = None
    type: Optional[str] = None  # medical, biodiversity, construction


class ExtractionResponse(BaseModel):
    id: int
    transcription_id: int
    user_id: int
    full_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    date_of_birth: Optional[str]
    address: Optional[str]
    age: Optional[int]
    form_type: Optional[str]
    extra_fields: Optional[dict]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== QUERY SCHEMAS =====
class SQLQueryCreate(BaseModel):
    extraction_id: int
    query: str
    action_type: str
    table_name: Optional[str] = None


class SQLQueryResponse(BaseModel):
    id: int
    extraction_id: int
    query: str
    action_type: str
    table_name: Optional[str]
    is_executed: bool
    execution_result: Optional[dict]
    created_at: datetime
    
    class Config:
        from_attributes = True


class CypherQueryCreate(BaseModel):
    extraction_id: int
    query: str
    action_type: str


class CypherQueryResponse(BaseModel):
    id: int
    extraction_id: int
    query: str
    action_type: str
    is_executed: bool
    execution_result: Optional[dict]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== GENERATED QUERY SCHEMAS =====
class GeneratedQueryCreate(BaseModel):
    query_text: str
    query_type: str = "sql"
    context: Optional[str] = None
    type: Optional[str] = None
    language: str = "fr-FR"


class GeneratedQueryResponse(BaseModel):
    id: int
    user_id: int
    query_text: str
    query_type: str
    context: Optional[str]
    type: Optional[str]
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===== REPORT SCHEMAS =====
class ReportCreate(BaseModel):
    transcription_id: int
    report_type: str
    title: str
    content: str
    format: str = "json"


class ReportResponse(BaseModel):
    id: int
    transcription_id: int
    user_id: int
    report_type: str
    title: str
    content: str
    format: str
    file_path: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== AUTH SCHEMAS =====
class Token(BaseModel):
    access_token: str
    token_type: str


class RegisterResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None


class TranscriptionExportRequest(BaseModel):
    text: str
    title: str = "Transcription Vocale"
    language: str = "fr"
    duration: Optional[float] = None
    type: Optional[str] = None # medical, biodiversity, construction, live

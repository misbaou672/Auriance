"""CRUD operations for medical search history"""
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.models import MedicalSearch


def create_medical_search(
    db: Session,
    *,
    user_id: Optional[int],
    query: str,
    results: dict,
    advice: dict,
) -> MedicalSearch:
    item = MedicalSearch(
        user_id=user_id,
        query=query,
        results=results,
        advice=advice,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_medical_search(db: Session, item_id: int) -> Optional[MedicalSearch]:
    return db.query(MedicalSearch).filter(MedicalSearch.id == item_id).first()


def list_medical_searches(db: Session, *, user_id: Optional[int] = None, limit: int = 50) -> List[MedicalSearch]:
    q = db.query(MedicalSearch)
    if user_id is not None:
        q = q.filter(MedicalSearch.user_id == user_id)
    return q.order_by(MedicalSearch.created_at.desc()).limit(limit).all()


def delete_medical_search(db: Session, item_id: int) -> bool:
    item = get_medical_search(db, item_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True

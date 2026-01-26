"""Routes pour le dashboard admin et les statistiques."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import logging

from app.db.session import SessionLocal
from app.models.rag_query import RagQuery

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])


@router.get("/rag-stats")
async def get_rag_stats(
    days: int = Query(7, description="Nombre de jours à analyser")
):
    """
    📊 Statistiques RAG pour le dashboard admin
    
    Retourne:
    - Total de requêtes
    - Questions les plus fréquentes
    - Activité par jour
    """
    try:
        with SessionLocal() as db:
            # Date limite
            since = datetime.utcnow() - timedelta(days=days)
            
            # Total de requêtes
            total = db.query(func.count(RagQuery.id)).filter(
                RagQuery.created_at >= since
            ).scalar()
            
            # Questions fréquentes (top 10)
            frequent_questions = db.query(
                RagQuery.question,
                func.count(RagQuery.id).label("count")
            ).filter(
                RagQuery.created_at >= since
            ).group_by(
                RagQuery.question
            ).order_by(
                desc("count")
            ).limit(10).all()
            
            # Activité par jour
            daily_activity = db.query(
                func.date(RagQuery.created_at).label("date"),
                func.count(RagQuery.id).label("count")
            ).filter(
                RagQuery.created_at >= since
            ).group_by(
                func.date(RagQuery.created_at)
            ).order_by(
                "date"
            ).all()
            
            # Hits moyens
            avg_hits = db.query(
                func.avg(RagQuery.hits_count)
            ).filter(
                RagQuery.created_at >= since
            ).scalar() or 0
            
            return {
                "success": True,
                "period_days": days,
                "total_queries": total,
                "avg_hits_per_query": round(float(avg_hits), 2),
                "frequent_questions": [
                    {"question": q, "count": c}
                    for q, c in frequent_questions
                ],
                "daily_activity": [
                    {"date": str(d), "count": c}
                    for d, c in daily_activity
                ]
            }
    
    except Exception as e:
        logger.error(f"❌ Erreur stats admin: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.get("/rag-history")
async def get_rag_history(
    limit: int = Query(50, description="Nombre max de résultats"),
    offset: int = Query(0, description="Offset pour pagination")
):
    """
    📜 Historique complet des requêtes RAG
    """
    try:
        with SessionLocal() as db:
            queries = db.query(RagQuery).order_by(
                desc(RagQuery.created_at)
            ).limit(limit).offset(offset).all()
            
            total = db.query(func.count(RagQuery.id)).scalar()
            
            return {
                "success": True,
                "total": total,
                "limit": limit,
                "offset": offset,
                "queries": [
                    {
                        "id": q.id,
                        "question": q.question,
                        "answer": q.answer[:200] + "..." if len(q.answer) > 200 else q.answer,
                        "hits_count": q.hits_count,
                        "created_at": q.created_at.isoformat() if q.created_at else None
                    }
                    for q in queries
                ]
            }
    
    except Exception as e:
        logger.error(f"❌ Erreur historique: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")

from __future__ import annotations
"""Medical search routes: semantic search + history + PDF export."""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from app.db.session import get_db
from app.services.embedding_service import get_embedding
from app.services.qdrant_service import ensure_collection, search as qdrant_search
from app.crud import (
    create_medical_search,
    list_medical_searches,
    get_medical_search,
    get_user_by_username,
)
from app.services.auth_service import decode_token

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
except Exception:
    A4 = None
    canvas = None


router = APIRouter(prefix="/api/medical", tags=["Medical Search"])


def _optional_user_id(request: Request, db: Session) -> Optional[int]:
    auth = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return None
    token = auth.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or not payload.get("username"):
        return None
    user = get_user_by_username(db, payload["username"])  # type: ignore[arg-type]
    return user.id if user else None


def _safe_advice(query: str, hits: List[dict]) -> dict:
    """Return non-diagnostic, general safety guidance with disclaimer."""
    return {
        "disclaimer": (
            "Ce service n’est pas un avis médical. En cas de symptômes graves, "
            "persistants, ou d’urgence (ex.: douleur thoracique, détresse respiratoire, "
            "altération de la conscience), contactez immédiatement les services d’urgence ou un professionnel de santé."
        ),
        "suggestions": [
            "Consultez un professionnel de santé pour une évaluation adaptée à votre situation.",
            "Notez l’apparition, la durée et l’évolution des symptômes pour faciliter la consultation.",
            "Hydratation et repos peuvent aider pour des symptômes bénins. Évitez l’automédication risquée.",
        ],
        "query": query,
        "hits_preview": [{"id": h.get("id"), "score": h.get("score")} for h in hits[:5]],
    }


@router.get("/search")
def medical_search(
    request: Request,
    query: str = Query(..., description="Terme médical (symptôme, pathologie, etc.)"),
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
):
    qdrant_error: Optional[str] = None
    hits: List[dict] = []
    try:
        ensure_collection(name="documents", vector_size=384, distance="Cosine", recreate=False)
        qvec = get_embedding(query)
        res = qdrant_search(collection="documents", query_vector=qvec, limit=limit, with_payload=True)
        hits = [
            {"id": str(h.id), "score": h.score, "payload": h.payload}
            for h in res
        ]
    except Exception as e:
        qdrant_error = str(e)

    advice = _safe_advice(query, hits)
    user_id = _optional_user_id(request, db)

    # Persist history
    item = create_medical_search(db, user_id=user_id, query=query, results={"hits": hits}, advice=advice)

    return {
        "history_id": item.id,
        "query": query,
        "results": hits,
        "advice": advice,
        "qdrant_error": qdrant_error,
    }


@router.get("/history")
def medical_history(
    request: Request,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    user_id = _optional_user_id(request, db)
    items = list_medical_searches(db, user_id=user_id, limit=limit)
    out = [
        {
            "id": it.id,
            "user_id": it.user_id,
            "query": it.query,
            "created_at": it.created_at.isoformat(),
        }
        for it in items
    ]
    return {"items": out}


@router.get("/history/{item_id}")
def medical_history_detail(item_id: int, db: Session = Depends(get_db)):
    item = get_medical_search(db, item_id)
    if not item:
        raise HTTPException(404, "History item not found")
    return {
        "id": item.id,
        "user_id": item.user_id,
        "query": item.query,
        "results": item.results,
        "advice": item.advice,
        "created_at": item.created_at.isoformat(),
    }


@router.get("/history/{item_id}/pdf")
def medical_history_pdf(item_id: int, db: Session = Depends(get_db)):
    item = get_medical_search(db, item_id)
    if not item:
        raise HTTPException(404, "History item not found")

    if canvas is None or A4 is None:
        raise HTTPException(500, "PDF engine not available. Please install reportlab.")

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    def _watermark(cnv):
        """Draw AURIANCE watermark centered on page like mobile transcription PDFs."""
        cnv.saveState()
        cnv.setFillGray(0.85, alpha=0.18)  # Light gray with opacity
        cnv.setFont("Helvetica-Bold", 72)
        
        # Center and rotate the watermark
        cnv.translate(width / 2, height / 2)
        cnv.rotate(45)
        cnv.drawCentredString(0, 0, "AURIANCE")
        cnv.restoreState()

    _watermark(c)
    y = height - 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, "AURIANCE - Résultat de recherche médicale")
    y -= 24
    c.setFont("Helvetica", 11)
    c.drawString(40, y, f"Requête: {item.query}")
    y -= 18
    c.drawString(40, y, f"Date: {item.created_at.isoformat()}")
    y -= 24

    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "Principaux résultats:")
    y -= 18
    c.setFont("Helvetica", 10)
    hits = (item.results or {}).get("hits", [])
    for h in hits[:10]:
        text = (h.get("payload") or {}).get("text") or "(texte indisponible)"
        score = h.get("score")
        line = f"- score={score:.3f}  {text}"
        for chunk in [line[i:i+100] for i in range(0, len(line), 100)]:
            if y < 60:
                c.showPage(); _watermark(c); y = height - 40
            c.drawString(50, y, chunk)
            y -= 14

    if y < 80:
        c.showPage(); _watermark(c); y = height - 40

    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "Conseils généraux (non médicaux):")
    y -= 18
    c.setFont("Helvetica", 10)
    adv = item.advice or {}
    disclaimer = adv.get("disclaimer") or ""
    suggestions = adv.get("suggestions") or []
    for chunk in [disclaimer[i:i+105] for i in range(0, len(disclaimer), 105)]:
        if y < 60:
            c.showPage(); _watermark(c); y = height - 40
        c.drawString(50, y, chunk)
        y -= 14
    for s in suggestions:
        line = f"- {s}"
        for chunk in [line[i:i+105] for i in range(0, len(line), 105)]:
            if y < 60:
                c.showPage(); _watermark(c); y = height - 40
            c.drawString(50, y, chunk)
            y -= 14

    c.showPage()
    c.save()
    buf.seek(0)

    filename = f"medical_search_{item.id}.pdf"
    return StreamingResponse(buf, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={filename}",
    })

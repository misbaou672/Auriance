"""Demo route that ties Qdrant vector search to a small Neo4j write."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.services.qdrant_service import ensure_collection, search
from app.services.embedding_service import get_embedding
from app.services.neo4j_service import upsert_symptom_diagnostic
from app.services.qdrant_service import upsert_points
import time

router = APIRouter(prefix="/api/demo", tags=["Demo"])


@router.get("/semantic-graph")
async def demo_semantic_graph(query: str = Query("fièvre", description="Terme de symptôme"), limit: int = 3):
    """Runs a toy Qdrant search then records the query as a symptom -> diagnostic -> treatment path in Neo4j."""
    try:
        ensure_collection(name="documents", vector_size=384, distance="Cosine", recreate=False)
        query_vec = get_embedding(query)
        hits = search(
            collection="documents",
            query_vector=query_vec,
            limit=limit,
            with_payload=True,
        )
        payload_hits = [
            {
                "id": str(hit.id),
                "score": hit.score,
                "payload": hit.payload,
            }
            for hit in hits
        ]
    except Exception as e:
        raise HTTPException(500, f"Qdrant search failed: {e}")

    neo4j_status = "ok"
    try:
        upsert_symptom_diagnostic(symptome=query, diagnostic_code="A00", traitement="paracetamol")
    except Exception as e:
        neo4j_status = f"error: {e}"

    return {
        "query": query,
        "qdrant_results": payload_hits,
        "neo4j": neo4j_status,
    }


class IngestRequest(BaseModel):
    text: str
    query: Optional[str] = None
    limit: int = 5


@router.post("/ingest-and-search")
async def ingest_and_search(body: IngestRequest):
    """Embed and upsert an ad-hoc text into Qdrant, then optionally run a search."""
    try:
        ensure_collection(name="documents", vector_size=384, distance="Cosine", recreate=False)
        vec = get_embedding(body.text)
        # Use integer ID based on current time
        pid = int(time.time())
        upsert_points("documents", [pid], [vec], [{"text": body.text}])
    except Exception as e:
        raise HTTPException(500, f"Qdrant upsert failed: {e}")

    hits = []
    if body.query:
        try:
            qvec = get_embedding(body.query)
            res = search(
                collection="documents",
                query_vector=qvec,
                limit=body.limit,
                with_payload=True,
            )
            hits = [
                {"id": str(h.id), "score": h.score, "payload": h.payload}
                for h in res
            ]
        except Exception as e:
            raise HTTPException(500, f"Qdrant search failed: {e}")

    return {"inserted_id": str(pid), "query": body.query, "qdrant_results": hits}


class IngestOnlyRequest(BaseModel):
    text: str
    id: Optional[int] = None


@router.post("/ingest")
async def ingest(body: IngestOnlyRequest):
    """Insert only: embed text and upsert into Qdrant."""
    try:
        ensure_collection(name="documents", vector_size=384, distance="Cosine", recreate=False)
        vec = get_embedding(body.text)
        pid = body.id if body.id is not None else int(time.time())
        upsert_points("documents", [pid], [vec], [{"text": body.text}])
        return {"inserted_id": str(pid), "text": body.text}
    except Exception as e:
        raise HTTPException(500, f"Qdrant ingest failed: {e}")


@router.get("/search")
async def semantic_search(query: str = Query(..., description="Search text"), limit: int = 5):
    """Search only: embed query and search Qdrant."""
    try:
        ensure_collection(name="documents", vector_size=384, distance="Cosine", recreate=False)
        qvec = get_embedding(query)
        res = search(
            collection="documents",
            query_vector=qvec,
            limit=limit,
            with_payload=True,
        )
        hits = [
            {"id": str(h.id), "score": h.score, "payload": h.payload}
            for h in res
        ]
        return {"query": query, "results": hits}
    except Exception as e:
        raise HTTPException(500, f"Qdrant search failed: {e}")

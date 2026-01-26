from __future__ import annotations
from typing import Optional, List, Iterable
import logging
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.core.config import QDRANT_URL, QDRANT_API_KEY

logger = logging.getLogger(__name__)

_client: Optional[QdrantClient] = None

def get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)
    return _client


def ensure_collection(
    name: str = "documents",
    vector_size: int = 384,
    distance: str = "Cosine",
    recreate: bool = False,
) -> None:
    client = get_client()
    dist = getattr(Distance, distance.upper())
    if recreate:
        client.recreate_collection(
            collection_name=name,
            vectors_config=VectorParams(size=vector_size, distance=dist)
        )
        logger.info("✅ Qdrant collection '%s' recreated (size=%d, distance=%s)", name, vector_size, distance)
    else:
        try:
            client.get_collection(name)
            logger.info("Qdrant collection '%s' exists", name)
        except Exception:
            client.recreate_collection(
                collection_name=name,
                vectors_config=VectorParams(size=vector_size, distance=dist)
            )
            logger.info("✅ Qdrant collection '%s' created (size=%d, distance=%s)", name, vector_size, distance)


def upsert_points(
    collection: str,
    ids: List[str],
    vectors: Iterable[Iterable[float]],
    payloads: Optional[List[dict]] = None,
) -> None:
    client = get_client()
    vec_list = [list(v) for v in vectors]
    pts: List[PointStruct] = []
    for i, vec in enumerate(vec_list):
        pl = payloads[i] if payloads and i < len(payloads) else None
        pts.append(PointStruct(id=ids[i], vector=vec, payload=pl))
    client.upsert(collection_name=collection, points=pts, wait=True)


def search(
    collection: str,
    query_vector: Iterable[float],
    limit: int = 5,
    with_payload: bool = True,
):
    client = get_client()
    return client.search(
        collection_name=collection,
        query_vector=list(query_vector),
        limit=limit,
        with_payload=with_payload,
    )

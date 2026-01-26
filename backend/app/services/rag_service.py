
"""RAG orchestrator: question -> Qdrant + Postgres + Neo4j -> LLM answer."""
from __future__ import annotations
import logging
import unicodedata
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy import text as sql_text
from app.db.session import SessionLocal
from app.services.embedding_service import get_embedding
from app.services.qdrant_service import ensure_collection, search
from app.services.llm_service import real_llm_service
from app.services.neo4j_service import get_driver
from app.models.rag_query import RagQuery

logger = logging.getLogger(__name__)


class RagService:
    def __init__(self) -> None:
        self.collection = "documents"

    def _extract_symptom_hint(self, question: str) -> str:
        q = (question or "").lower()
        for kw in [
            "fièvre",
            "fever",
            "toux",
            "cough",
            "migraine",
            "grippe",
            "allergie",
            "douleur",
        ]:
            if kw in q:
                return kw
        # fallback: keep a short hint for display
        return (question or "").strip()[:64] or "symptôme"

    def _sql_escape_literal(self, value: str) -> str:
        return (value or "").replace("'", "''")

    def _strip_accents(self, value: str) -> str:
        if not value:
            return ""
        normalized = unicodedata.normalize("NFKD", value)
        return "".join(ch for ch in normalized if not unicodedata.combining(ch))

    def _fetch_postgres(self, question: str, limit: int = 3) -> Tuple[List[Dict[str, Any]], str]:
        """Recherche Postgres sur les consultations.

        IMPORTANT: Le schéma effectivement créé par `app.core.database.init_database()` est:
        - patients(prenom, nom, ...)
        - consultations(date_consultation, transcription_audio, notes_medicales, ...)

        Donc on cherche le terme dans `notes_medicales` et/ou `transcription_audio`.
        """
        symptom = self._extract_symptom_hint(question)
        symptom_ascii = self._strip_accents(symptom)

        terms = [t for t in [symptom, symptom_ascii] if t]
        # Avoid duplicate patterns when already identical
        if len(terms) == 2 and terms[0].lower() == terms[1].lower():
            terms = [terms[0]]

        safe_like_1 = self._sql_escape_literal(terms[0])
        safe_like_2 = self._sql_escape_literal(terms[1]) if len(terms) > 1 else safe_like_1

        sql_query_display = (
            "SELECT p.id AS patient_id, p.prenom, p.nom, c.id AS consultation_id, c.date_consultation, "
            "c.notes_medicales, c.transcription_audio "
            "FROM consultations c LEFT JOIN patients p ON p.id = c.patient_id "
            "WHERE ("
            f"c.notes_medicales ILIKE '%{safe_like_1}%' OR c.transcription_audio ILIKE '%{safe_like_1}%' "
            f"OR c.notes_medicales ILIKE '%{safe_like_2}%' OR c.transcription_audio ILIKE '%{safe_like_2}%'"
            ") "
            f"ORDER BY c.date_consultation DESC LIMIT {limit};"
        )

        snippets: List[Dict[str, Any]] = []
        with SessionLocal() as db:
            q = sql_text(
                """
                SELECT
                    p.id AS patient_id,
                    c.id AS consultation_id,
                    p.prenom AS patient_prenom,
                    p.nom AS patient_nom,
                    c.date_consultation,
                    c.notes_medicales,
                    c.transcription_audio,
                    c.statut
                FROM consultations c
                LEFT JOIN patients p ON p.id = c.patient_id
                WHERE (
                      (c.notes_medicales IS NOT NULL AND (c.notes_medicales ILIKE :q1 OR c.notes_medicales ILIKE :q2))
                   OR (c.transcription_audio IS NOT NULL AND (c.transcription_audio ILIKE :q1 OR c.transcription_audio ILIKE :q2))
                )
                ORDER BY c.date_consultation DESC
                LIMIT :limit
                """
            )
            rows = db.execute(
                q,
                {
                    "q1": f"%{terms[0]}%",
                    "q2": f"%{terms[1]}%" if len(terms) > 1 else f"%{terms[0]}%",
                    "limit": limit,
                },
            ).fetchall()
            for r in rows:
                prenom = getattr(r, "patient_prenom", None)
                nom = getattr(r, "patient_nom", None)
                patient_name = (f"{prenom} {nom}" if prenom else (nom or "")).strip() or None
                snippets.append(
                    {
                        "patient_id": getattr(r, "patient_id", None),
                        "patient_prenom": prenom,
                        "patient_nom": nom,
                        "patient_name": patient_name,
                        "consultation_id": getattr(r, "consultation_id", None),
                        "date_consultation": str(getattr(r, "date_consultation", "")),
                        "notes_medicales": getattr(r, "notes_medicales", None),
                        "transcription_audio": getattr(r, "transcription_audio", None),
                        "statut": getattr(r, "statut", None),
                    }
                )

        return snippets, sql_query_display

    def _fetch_neo4j(self, question: str, limit: int = 3) -> Tuple[List[Dict[str, Any]], str]:
        """Recherche Neo4j orientée symptômes -> diagnostics -> traitements.

        Démo cohérente avec `neo4j_service.upsert_symptom_diagnostic`:
        (Symptome {name})-[:INDIQUE]->(Diagnostic {code})-[:PROPOSE]->(Traitement {name}).
        """
        drv = get_driver()
        symptom = self._extract_symptom_hint(question)

        cypher_query_display = (
            "MATCH (s:Symptome) WHERE toString(s.name) CONTAINS '%s' "
            "OPTIONAL MATCH (s)-[:INDIQUE]->(d:Diagnostic) "
            "OPTIONAL MATCH (d)-[:PROPOSE]->(t:Traitement) "
            "RETURN s.name AS symptome, d.code AS diagnostic, collect(DISTINCT t.name) AS traitements "
            "LIMIT %d;" % (symptom, limit)
        )

        hits: List[Dict[str, Any]] = []
        cypher = (
            "MATCH (s:Symptome) "
            "WHERE s.name IS NOT NULL AND toLower(toString(s.name)) CONTAINS toLower($symptom) "
            "OPTIONAL MATCH (s)-[:INDIQUE]->(d:Diagnostic) "
            "OPTIONAL MATCH (d)-[:PROPOSE]->(t:Traitement) "
            "RETURN s.name AS symptome, d.code AS diagnostic, collect(DISTINCT t.name) AS traitements "
            "LIMIT $limit"
        )

        with drv.session() as session:
            res = session.run(cypher, {"symptom": symptom, "limit": limit})
            for record in res:
                hits.append(
                    {
                        "symptome": record.get("symptome"),
                        "diagnostic": record.get("diagnostic"),
                        "traitements": record.get("traitements") or [],
                    }
                )

        return hits, cypher_query_display


    async def answer(
        self,
        question: str,
        top_k: int = 5,
        target_language: str = "fr",
        original_question: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Récupère du contexte multi-sources puis génère une réponse avec le LLM."""
        symptom_hint = self._extract_symptom_hint(question)
        vector_query_display = (
            "qdrant.search(collection='documents', query_vector=embed('%s'), limit=%d)" % (symptom_hint, top_k)
        )

        qdrant_error: Optional[str] = None
        postgres_error: Optional[str] = None
        neo4j_error: Optional[str] = None

        hits_raw = []
        try:
            ensure_collection(name=self.collection, vector_size=384, distance="Cosine", recreate=False)
            query_vec = get_embedding(question)
            hits_raw = search(
                collection=self.collection,
                query_vector=query_vec,
                limit=top_k,
                with_payload=True,
            )
        except Exception as e:
            qdrant_error = str(e)
            logger.warning(f"[RAG] Qdrant search failed: {e}")

        hits: List[Dict[str, Any]] = []
        context_chunks: List[str] = []
        for h in hits_raw:
            payload = h.payload or {}
            text = payload.get("text") or payload.get("content") or str(payload)
            hits.append({"id": str(h.id), "score": h.score, "payload": payload})
            if text:
                context_chunks.append(text)

        # Postgres
        sql_query_display = ""
        pg_snippets: List[Dict[str, Any]] = []
        try:
            pg_snippets, sql_query_display = self._fetch_postgres(question, limit=3)
            for snip in pg_snippets:
                pg_text = snip.get("notes_medicales") or snip.get("transcription_audio")
                if pg_text:
                    context_chunks.append(
                        f"[PG] {snip.get('patient_name') or snip.get('patient_id')}: {pg_text}"
                    )
        except Exception as e:
            postgres_error = str(e)
            logger.warning(f"[RAG] Postgres search failed: {e}")

        # Neo4j
        cypher_query_display = ""
        neo_hits: List[Dict[str, Any]] = []
        try:
            neo_hits, cypher_query_display = self._fetch_neo4j(question, limit=3)
            for row in neo_hits:
                if row.get("symptome") or row.get("diagnostic"):
                    context_chunks.append(f"[NEO4J] {row}")
        except Exception as e:
            neo4j_error = str(e)
            logger.warning(f"[RAG] Neo4j search failed: {e}")

        context_text = "\n".join(f"- {c}" for c in context_chunks)

        # LLM structuré avec consignes explicites pour gérer le hors-contexte
        answer = await real_llm_service.generate_health_response(
            user_query=question,
            context=context_text,
            target_language=target_language,
            original_question=original_question,
            context_meta={
                "qdrant_hits": len(hits),
                "postgres_hits": len(pg_snippets),
                "neo4j_hits": len(neo_hits),
                "context_used": bool(context_chunks),
            },
        )

        # Sauvegarder dans l'historique
        try:
            with SessionLocal() as db:
                rag_entry = RagQuery(
                    question=question,
                    answer=answer,
                    hits_count=len(hits) + len(pg_snippets) + len(neo_hits),
                    hits_data={
                        "qdrant": hits[:3],  # Limiter pour éviter trop de données
                        "postgres": pg_snippets,
                        "neo4j": neo_hits,
                    },
                )
                db.add(rag_entry)
                db.commit()
                logger.info(f"✅ RAG query saved to history (ID: {rag_entry.id})")
        except Exception as e:
            logger.warning(f"⚠️ Failed to save RAG history: {e}")

        return {
            "question": question,
            "answer": answer,
            "hits_qdrant": hits,
            "hits_postgres": pg_snippets,
            "hits_neo4j": neo_hits,
            "sql_query": sql_query_display,
            "cypher_query": cypher_query_display,
            "vector_query": vector_query_display,
            "qdrant_error": qdrant_error,
            "postgres_error": postgres_error,
            "neo4j_error": neo4j_error,
            "target_language": target_language,
            "context_used": bool(context_chunks),
        }


rag_service = RagService()

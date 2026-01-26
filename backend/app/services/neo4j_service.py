from __future__ import annotations
from neo4j import GraphDatabase, Driver
from typing import Optional, Dict, Any
import logging
from app.core.config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

logger = logging.getLogger(__name__)

_driver: Optional[Driver] = None

def get_driver() -> Driver:
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    return _driver

def init_constraints() -> None:
    """Create basic constraints/indexes to support medical relations."""
    drv = get_driver()
    cypher_statements = [
        "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Patient) REQUIRE p.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (m:Medecin) REQUIRE m.email IS UNIQUE",
        "CREATE INDEX IF NOT EXISTS FOR (s:Symptome) ON (s.name)",
        "CREATE INDEX IF NOT EXISTS FOR (d:Diagnostic) ON (d.code)",
        "CREATE INDEX IF NOT EXISTS FOR (t:Traitement) ON (t.name)"
    ]
    with drv.session() as session:
        for q in cypher_statements:
            session.run(q)
    logger.info("✅ Neo4j constraints/indexes ensured")

def upsert_symptom_diagnostic(symptome: str, diagnostic_code: str, traitement: str | None = None) -> None:
    """Create or link Symptome -> Diagnostic -> Traitement demo path."""
    drv = get_driver()
    query = """
        MERGE (s:Symptome {name: $symptome})
        MERGE (d:Diagnostic {code: $code})
        MERGE (s)-[:INDIQUE]->(d)
        WITH d, $traitement AS tr
        FOREACH (_ IN CASE WHEN tr IS NULL THEN [] ELSE [1] END |
            MERGE (t:Traitement {name: tr})
            MERGE (d)-[:PROPOSE]->(t)
        )
        RETURN d
    """
    with drv.session() as session:
        session.run(query, {"symptome": symptome, "code": diagnostic_code, "traitement": traitement})


def close() -> None:
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None

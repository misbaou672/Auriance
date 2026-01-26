"""Initialize Neo4j graph with basic constraints and a demo path."""
from app.services.neo4j_service import init_constraints, upsert_symptom_diagnostic

if __name__ == "__main__":
    init_constraints()
    # Demo relation: Symptome -> Diagnostic -> Traitement
    upsert_symptom_diagnostic("fièvre", "A00", "paracétamol")
    print("✅ Neo4j initialized with demo data")

"""Initialize Qdrant collection and add a couple of demo vectors.
Note: For real embeddings, plug a sentence transformer.
"""
from app.services.qdrant_service import ensure_collection, upsert_points
from app.services.embedding_service import get_embedding

if __name__ == "__main__":
    ensure_collection(name="documents", vector_size=384, distance="Cosine", recreate=True)
    payloads = [
        {"text": "Compte-rendu de consultation avec fièvre"},
        {"text": "Observation de fièvre et frissons chez patient"},
        {"text": "Conseils: paracétamol pour fièvre, hydratation"},
        {"text": "Symptômes grippaux: toux, fièvre, courbatures"},
        {"text": "Fièvre persistante: consulter un médecin"},
        {"text": "Biodiversité: observation d'oiseaux dans le parc"},
    ]
    ids = list(range(1, len(payloads) + 1))
    vectors = [get_embedding(p["text"]) for p in payloads]
    upsert_points("documents", ids, vectors, payloads)
    print("✅ Qdrant initialized with enriched demo points (embedded)")

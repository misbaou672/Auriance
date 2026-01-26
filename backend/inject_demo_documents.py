"""
Script d'injection de documents variés (non médicaux et médicaux) dans Qdrant pour enrichir la base RAG.
"""
import os
import uuid
from app.services.qdrant_service import ensure_collection, upsert_points
from app.services.embedding_service import get_embedding

# Exemples de documents variés (à enrichir selon besoin)
documents = [
    {
        "text": "Comment organiser une réunion efficace en entreprise ? Pour réussir, préparez un ordre du jour, invitez les bonnes personnes, respectez le temps imparti et envoyez un compte-rendu.",
        "category": "entreprise",
        "source": "guide_entreprise"
    },
    {
        "text": "Quels sont les droits des personnes âgées en France ? Les seniors bénéficient d’aides sociales, de dispositifs de maintien à domicile et de droits spécifiques en matière de santé et de logement.",
        "category": "seniors",
        "source": "faq_seniors"
    },
    {
        "text": "Comment prévenir les accidents domestiques chez les enfants ? Rangez les produits dangereux, installez des barrières de sécurité et surveillez les enfants dans la cuisine et la salle de bain.",
        "category": "famille",
        "source": "prevention_maison"
    },
    {
        "text": "Quelles sont les étapes pour créer une entreprise en France ? Rédiger un business plan, choisir un statut juridique, immatriculer l’entreprise et ouvrir un compte bancaire professionnel.",
        "category": "entreprise",
        "source": "creation_entreprise"
    },
    {
        "text": "Quels sont les bienfaits de l’activité physique régulière ? Elle améliore la santé cardiovasculaire, réduit le stress, favorise le sommeil et prévient de nombreuses maladies.",
        "category": "santé",
        "source": "bien_etre"
    },
    {
        "text": "Comment utiliser un smartphone pour la première fois ? Allumez l’appareil, configurez le Wi-Fi, créez un compte Google ou Apple, et explorez les applications de base comme l’appareil photo et les messages.",
        "category": "seniors",
        "source": "guide_numerique"
    },
    {
        "text": "Quels sont les gestes à adopter en cas d’incendie domestique ? Prévenez les secours, évacuez calmement, ne prenez pas l’ascenseur et couvrez-vous le nez avec un linge humide.",
        "category": "sécurité",
        "source": "prevention_incendie"
    },
    # Ajoute ici d'autres documents selon les besoins (culture, tech, sport, etc.)
]

COLLECTION = "documents"

if __name__ == "__main__":
    print("🔄 Injection de documents variés dans Qdrant...")
    ensure_collection(name=COLLECTION, vector_size=384, distance="Cosine", recreate=False)
    ids = [str(uuid.uuid4()) for _ in documents]
    vectors = [get_embedding(doc["text"]) for doc in documents]
    payloads = documents
    upsert_points(COLLECTION, ids, vectors, payloads)
    print(f"✅ {len(documents)} documents injectés dans Qdrant.")

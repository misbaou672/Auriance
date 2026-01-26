from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

print("🚀 INITIALISATION QDRANT POUR AURIANCE...")

# Connexion à Qdrant
client = QdrantClient(host="qdrant", port=6333)

# Collection pour les transcriptions médicales
client.recreate_collection(
    collection_name="transcriptions_medicales",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# Collection pour les codes CIM/CCAM  
client.recreate_collection(
    collection_name="codes_medicaux",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# Collection pour les patients similaires
client.recreate_collection(
    collection_name="patients_similaires",
    vectors_config=VectorParams(size=512, distance=Distance.COSINE)
)

print("✅ COLLECTIONS QDRANT CRÉÉES POUR AURIANCE !")
print("   - transcriptions_medicales")
print("   - codes_medicaux")
print("   - patients_similaires")

# Données de test pour les codes médicaux
codes_medicaux = [
    {
        "id": 1,
        "vector": [0.1] * 384,
        "payload": {
            "code_cim": "E11",
            "libelle": "Diabète sucré de type 2",
            "chapitre": "Maladies endocriniennes",
            "type": "diagnostic"
        }
    },
    {
        "id": 2,
        "vector": [0.2] * 384,
        "payload": {
            "code_cim": "I10", 
            "libelle": "Hypertension essentielle",
            "chapitre": "Maladies cardiovasculaires",
            "type": "diagnostic"
        }
    }
]

# Insérer les données
client.upsert(
    collection_name="codes_medicaux",
    points=codes_medicaux
)

print("✅ DONNÉES MÉDICALES INITIALES INSÉRÉES")
print("🎉 QDRANT AURIANCE PRÊT !")
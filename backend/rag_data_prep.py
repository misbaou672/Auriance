import os
import json
from typing import List, Dict
from chromadb import Client, Settings
from chromadb.utils import embedding_functions
from time import sleep
import requests # Utilisé pour simuler l'appel LLM ou l'utiliser si besoin d'un modèle en ligne

# Configuration du modèle d'embedding (gratuit et performant pour le RAG)
# C'est ce modèle qui transforme le texte en vecteur numérique
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2" 

class RAGService:
    """
    Service dédié à la gestion de la Base de Connaissances Vectorielle (RAG).
    Utilise ChromaDB pour l'indexation et la recherche de protocoles infirmiers.
    """
    
    def __init__(self, db_path: str = "chroma_db", collection_name: str = "protocoles_infirmiers"):
        """Initialise la base de données Chroma."""
        self.db_path = db_path
        self.collection_name = collection_name
        
        # Initialisation du client ChromaDB (stockage local)
        self.client = Client(Settings(persist_directory=self.db_path))
        
        # Fonction d'embedding utilisant un modèle SBERT de Hugging Face
        self.ef = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=EMBEDDING_MODEL_NAME
        )
        
        # Récupération ou création de la collection
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name, 
            embedding_function=self.ef
        )
        
        # Vérifie si la base de données est vide et l'initialise si nécessaire
        if self.collection.count() == 0:
            print("🚀 La base vectorielle est vide. Démarrage de l'indexation des protocoles...")
            self._load_and_index_documents("rag_documents_infirmiers.json")
        else:
            print(f"✅ Base vectorielle chargée. {self.collection.count()} documents indexés.")

    def _load_and_index_documents(self, file_path: str):
        """
        Charge les documents JSON (scrappés) et les indexe dans ChromaDB.
        """
        if not os.path.exists(file_path):
            print(f"🛑 Erreur: Fichier de données RAG non trouvé à {file_path}. Exécutez 'rag_data_prep.py' d'abord.")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extraction des données au format attendu par ChromaDB
        documents = [item['text'] for item in data]
        metadatas = [item['metadata'] for item in data]
        ids = [item['doc_id'] for item in data]
        
        try:
            # Ajout des documents. L'embedding est généré automatiquement ici.
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print(f"🎉 Indexation terminée. {len(documents)} documents ajoutés.")
        except Exception as e:
            print(f"❌ Erreur lors de l'indexation ChromaDB: {e}")

    def retrieve_context(self, query: str, k: int = 3) -> List[str]:
        """
        Recherche les 'k' documents les plus pertinents pour la requête donnée (RAG).
        """
        if self.collection.count() == 0:
            return ["ATTENTION: Base de connaissances non chargée ou vide. Réponse non contextualisée."]
            
        # Effectue la recherche de similarité
        results = self.collection.query(
            query_texts=[query],
            n_results=k,
            include=['documents']
        )
        
        # Extrait le texte des documents trouvés
        if results and results.get('documents') and results['documents'][0]:
            return results['documents'][0]
        return []

class UniversalAIService:
    """
    Service principal pour gérer la logique du LLM et l'intégration du RAG.
    """
    def __init__(self):
        self.rag_service = RAGService()
        self.system_prompt = (
            "Vous êtes Aurian, un assistant infirmier spécialisé, professionnel et empathique. "
            "Vous répondez uniquement en français. Votre rôle est de fournir des informations précises "
            "basées sur le contexte fourni, tout en adoptant un ton calme et aidant. "
            "Si le contexte ne permet pas de répondre, vous devez l'indiquer poliment."
        )
        
    def generate_response(self, user_query: str) -> str:
        """
        Génère une réponse LLM en utilisant le contexte RAG.
        """
        print(f"-> Requête Utilisateur: {user_query}")
        
        # 1. Étape RAG: Récupération du contexte
        retrieved_contexts = self.rag_service.retrieve_context(user_query)
        
        # Concaténation du contexte pour l'injection dans le prompt LLM
        context_string = "\n---\n".join(retrieved_contexts)
        
        # 2. Construction du Prompt Augmenté
        full_prompt = (
            f"{self.system_prompt}\n\n"
            f"Contexte fourni (Protocoles Infirmiers):\n{context_string}\n\n"
            f"Question de l'infirmière : {user_query}\n\n"
            f"Réponse d'Aurian (en respectant le ton infirmier et le protocole) : "
        )

        print("-> Prompt envoyé au LLM (Tronqué pour l'affichage):")
        print(full_prompt[:500] + "...")
        
        # --- 3. Simulation de l'appel au LLM (ici, c'est une simulation !) ---
        # Dans votre projet final, vous remplaceriez ceci par:
        # - L'appel à un modèle local Fine-Tuned (Mistral/Llama)
        # - OU l'appel à une API comme l'API Gemini ou Deepseek (si budget/clé dispo)
        
        if not retrieved_contexts or "ATTENTION" in retrieved_contexts[0]:
             # Réponse si pas de contexte trouvé
             return (
                 "Je n'ai pas trouvé de protocole correspondant directement à votre question dans ma base de "
                 "connaissances actuelle. Pourriez-vous reformuler ou s'agit-il d'une situation "
                 "qui nécessite un jugement clinique immédiat ?"
             )

        # Simulation d'une réponse enrichie par le contexte RAG
        # En production, le LLM lit le contexte_string et génère la réponse
        sleep(1.5) # Simule le temps de latence de l'IA
        
        # Exemple de réponse basée sur le contexte du Protocole P001 (Injection)
        if "injection sous-cutanée" in user_query.lower() or "héparine" in user_query.lower():
             return (
                 "C'est un soin fréquent, soyez méthodique. Conformément au protocole, après la vérification des 5 BONS, "
                 "choisissez une zone d'injection (abdomen/cuisse) et alternez les sites. Pincez doucement la peau, "
                 "injectez lentement et retirez l'aiguille. Rappel très important : **NE MASSEZ JAMAIS** la zone après l'injection."
             )
        
        # Exemple de réponse basée sur le contexte du Protocole P003 (Chute)
        elif "chute" in user_query.lower() or "tomber" in user_query.lower():
             return (
                 "Urgence! Le protocole dit : Ne déplacez jamais le patient. Évaluez rapidement l'état de conscience et les douleurs. "
                 "Sécurisez l'environnement et alertez immédiatement le médecin pour une prise en charge complète. "
                 "Nous remplirons le formulaire d'événement indésirable après stabilisation."
             )
        
        else:
             return f"Le contexte pertinent a été récupéré (protocoles trouvés: {len(retrieved_contexts)}), mais je vous donne une réponse par défaut en l'absence de LLM connecté: 'La bonne pratique consiste à [Réponse LLM basée sur le RAG].'"

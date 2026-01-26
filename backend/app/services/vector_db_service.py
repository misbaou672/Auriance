"""Vector Database Service using ChromaDB

Lazy-initializes ChromaDB so the API can start even if ChromaDB
is not installed. Methods become no-ops when the client isn't available.
"""
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class VectorDBService:
    """Service for managing embeddings and semantic search"""
    
    def __init__(self):
        """Initialize ChromaDB client if available"""
        self.client = None
        self.transcriptions_collection = None
        self.extractions_collection = None
        try:
            import chromadb  # lazy import
            # Use PersistentClient (new API)
            self.client = chromadb.PersistentClient(path="./chroma_db")

            # Create collections for different types
            self.transcriptions_collection = self.client.get_or_create_collection(
                name="transcriptions",
                metadata={"description": "Audio transcriptions embeddings"}
            )

            self.extractions_collection = self.client.get_or_create_collection(
                name="extractions",
                metadata={"description": "Extracted information embeddings"}
            )

            logger.info("✅ ChromaDB initialized successfully")
        except ImportError:
            logger.warning("ChromaDB non installé. Vector DB désactivé.")
        except Exception as e:
            logger.error(f"❌ ChromaDB initialization failed: {e}")
    
    def add_transcription(self, transcription_id: int, text: str, metadata: Dict = None):
        """Add transcription to vector DB"""
        try:
            if not self.transcriptions_collection:
                return
            self.transcriptions_collection.add(
                documents=[text],
                ids=[str(transcription_id)],
                metadatas=[metadata or {}]
            )
            logger.info(f"✅ Added transcription {transcription_id} to vector DB")
        except Exception as e:
            logger.error(f"❌ Failed to add transcription: {e}")
    
    def search_similar_transcriptions(self, query: str, n_results: int = 5) -> List[Dict]:
        """Search for similar transcriptions"""
        try:
            if not self.transcriptions_collection:
                return {"ids": [], "documents": [], "distances": [], "metadatas": []}
            results = self.transcriptions_collection.query(
                query_texts=[query],
                n_results=n_results
            )

            return {
                "ids": results["ids"][0],
                "documents": results["documents"][0],
                "distances": results["distances"][0],
                "metadatas": results["metadatas"][0]
            }
        except Exception as e:
            logger.error(f"❌ Search failed: {e}")
            return {"ids": [], "documents": [], "distances": [], "metadatas": []}
    
    def add_extraction(self, extraction_id: int, extracted_data: str, metadata: Dict = None):
        """Add extracted information to vector DB"""
        try:
            if not self.extractions_collection:
                return
            self.extractions_collection.add(
                documents=[extracted_data],
                ids=[str(extraction_id)],
                metadatas=[metadata or {}]
            )
            logger.info(f"✅ Added extraction {extraction_id} to vector DB")
        except Exception as e:
            logger.error(f"❌ Failed to add extraction: {e}")
    
    def search_similar_extractions(self, query: str, n_results: int = 5) -> List[Dict]:
        """Search for similar extractions"""
        try:
            if not self.extractions_collection:
                return {"ids": [], "documents": [], "distances": [], "metadatas": []}
            results = self.extractions_collection.query(
                query_texts=[query],
                n_results=n_results
            )

            return {
                "ids": results["ids"][0],
                "documents": results["documents"][0],
                "distances": results["distances"][0],
                "metadatas": results["metadatas"][0]
            }
        except Exception as e:
            logger.error(f"❌ Search failed: {e}")
            return {"ids": [], "documents": [], "distances": [], "metadatas": []}
    
    def delete_transcription(self, transcription_id: int):
        """Delete transcription from vector DB"""
        try:
            if not self.transcriptions_collection:
                return
            self.transcriptions_collection.delete(ids=[str(transcription_id)])
            logger.info(f"✅ Deleted transcription {transcription_id} from vector DB")
        except Exception as e:
            logger.error(f"❌ Failed to delete transcription: {e}")
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about collections"""
        return {
            "transcriptions": self.transcriptions_collection.count() if self.transcriptions_collection else 0,
            "extractions": self.extractions_collection.count() if self.extractions_collection else 0,
        }


# Singleton instance
vector_db = VectorDBService()

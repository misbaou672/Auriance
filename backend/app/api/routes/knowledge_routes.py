# app/api/routes/knowledge_routes.py
from fastapi import APIRouter, HTTPException
from app.services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["Knowledge"])

@router.get("/search")
async def search_knowledge(query: str, max_results: int = 3):
    """
    Recherche intelligente dans les connaissances santé
    """
    try:
        service = KnowledgeService()
        results = await service.search_health_resources(query, max_results)
        return {
            "query": query,
            "results": results,
            "total_found": len(results)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la recherche: {str(e)}"
        )

@router.get("/scrape/{topic}")
async def scrape_health_topic(topic: str):
    """
    Scrapping de ressources santé sur un sujet spécifique
    """
    try:
        service = KnowledgeService()
        resources = await service.scrape_health_resources(topic)
        return {
            "topic": topic,
            "resources": resources,
            "total_resources": len(resources)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du scrapping: {str(e)}"
        )

@router.get("/health")
async def knowledge_health_check():
    return {
        "status": "healthy",
        "service": "Knowledge Base",
        "capabilities": ["semantic_search", "resource_scraping", "vector_storage"]
    }
"""Service pour enrichir les données médicales avec une API gratuite."""
import logging
import aiohttp
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class WikidataMedicalService:
    """Service pour chercher des infos médicales sur Wikidata (API gratuite)."""
    
    WIKIDATA_API = "https://www.wikidata.org/w/api.php"
    
    async def search_disease(self, disease_name: str) -> Dict[str, Any]:
        """
        Cherche une maladie sur Wikidata.
        
        Retourne:
        {
            "label": "Grippe",
            "description": "Infection virale...",
            "id": "Q16814",
            "symptoms": [...],
            "treatments": [...]
        }
        """
        try:
            async with aiohttp.ClientSession() as session:
                # Étape 1: Chercher l'entité
                params = {
                    "action": "wbsearchentities",
                    "search": disease_name,
                    "language": "fr",
                    "format": "json"
                }
                
                async with session.get(self.WIKIDATA_API, params=params, timeout=5) as resp:
                    if resp.status != 200:
                        return {}
                    
                    data = await resp.json()
                    if not data.get("search"):
                        return {}
                    
                    entity = data["search"][0]
                    qid = entity["id"]
                    
                    logger.info(f"🔍 Trouvé Wikidata entity pour '{disease_name}': {qid}")
                    
                    # Étape 2: Récupérer les détails
                    return await self._get_entity_details(session, qid)
        
        except Exception as e:
            logger.warning(f"⚠️  Erreur Wikidata pour '{disease_name}': {e}")
            return {}
    
    async def _get_entity_details(self, session: aiohttp.ClientSession, qid: str) -> Dict[str, Any]:
        """Récupère les détails d'une entité Wikidata."""
        try:
            params = {
                "action": "wbgetentities",
                "ids": qid,
                "format": "json",
                "languages": "fr|en"
            }
            
            async with session.get(self.WIKIDATA_API, params=params, timeout=5) as resp:
                if resp.status != 200:
                    return {}
                
                data = await resp.json()
                entity = data.get("entities", {}).get(qid, {})
                
                result = {
                    "label": entity.get("labels", {}).get("fr", {}).get("value", ""),
                    "description": entity.get("descriptions", {}).get("fr", {}).get("value", ""),
                    "id": qid,
                    "symptoms": [],
                    "treatments": [],
                }
                
                # Essayer d'extraire les symptômes (P780 = symptoms)
                claims = entity.get("claims", {})
                if "P780" in claims:
                    for claim in claims["P780"]:
                        try:
                            symptom_qid = claim["mainsnak"]["datavalue"]["value"]["id"]
                            result["symptoms"].append(symptom_qid)
                        except:
                            pass
                
                # Essayer d'extraire les traitements (P2176 = drug or agent)
                if "P2176" in claims:
                    for claim in claims["P2176"]:
                        try:
                            treatment_qid = claim["mainsnak"]["datavalue"]["value"]["id"]
                            result["treatments"].append(treatment_qid)
                        except:
                            pass
                
                return result
        
        except Exception as e:
            logger.warning(f"⚠️  Erreur récupération détails Wikidata: {e}")
            return {}


# Test simple
if __name__ == "__main__":
    import asyncio
    
    async def test():
        service = WikidataMedicalService()
        result = await service.search_disease("grippe")
        print(f"Grippe: {result}")
    
    asyncio.run(test())

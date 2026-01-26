# 📁 app/api/routes/nutrition_routes.py
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])

@router.get("/info/{aliment}")
async def get_info_nutrition(aliment: str):
    """API nutrition avec recherche intelligente"""
    try:
        # Recherche dans Open Food Facts avec terme français
        async with httpx.AsyncClient() as client:
            # Essayer plusieurs termes de recherche
            search_terms = [
                aliment,
                aliment.replace(" ", "%20"),
                aliment + " france"
            ]
            
            for term in search_terms:
                response = await client.get(
                    f"https://world.openfoodfacts.org/cgi/search.pl",
                    params={
                        "search_terms": term,
                        "search_simple": 1,
                        "json": 1,
                        "page_size": 1
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("products") and len(data["products"]) > 0:
                        product = data["products"][0]
                        
                        return {
                            "aliment": product.get("product_name_fr") or product.get("product_name", aliment),
                            "marque": product.get("brands", "Inconnu"),
                            "nutriscore": product.get("nutriscore_grade", "N/A").upper(),
                            "calories": product.get("nutriments", {}).get("energy-kcal_100g", "N/A"),
                            "proteines": product.get("nutriments", {}).get("proteins_100g", "N/A"),
                            "glucides": product.get("nutriments", {}).get("carbohydrates_100g", "N/A"),
                            "lipides": product.get("nutriments", {}).get("fat_100g", "N/A"),
                            "source": "Open Food Facts"
                        }
            
            # Si aucun produit trouvé, retourner des données génériques
            return get_generic_nutrition_info(aliment)
            
    except Exception as e:
        return get_generic_nutrition_info(aliment)

def get_generic_nutrition_info(aliment: str):
    """Données nutritionnelles génériques"""
    generic_data = {
        "pomme": {"calories": 52, "glucides": 14, "fibres": 2.4},
        "banane": {"calories": 89, "glucides": 23, "potassium": 358},
        "poulet": {"calories": 165, "proteines": 31, "lipides": 3.6},
        "riz": {"calories": 130, "glucides": 28, "proteines": 2.7},
        "pizza": {"calories": 266, "glucides": 33, "lipides": 10},
        "pain": {"calories": 265, "glucides": 49, "fibres": 2.7}
    }
    
    aliment_lower = aliment.lower()
    for key, info in generic_data.items():
        if key in aliment_lower:
            return {
                "aliment": aliment,
                "calories": info["calories"],
                "glucides": info.get("glucides", "N/A"),
                "proteines": info.get("proteines", "N/A"),
                "lipides": info.get("lipides", "N/A"),
                "source": "Base de données générique"
            }
    
    return {
        "aliment": aliment,
        "conseil": "Mangez varié et équilibré",
        "source": "Recommandations nutritionnelles générales"
    }
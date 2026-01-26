# app/services/external/official_health_service.py
import aiohttp
import requests
from typing import Dict, Any, List
from datetime import datetime

class OfficialHealthDataService:
    """
    Service pour les APIs gouvernementales et officielles GRATUITES
    Données réelles, mises à jour quotidiennement
    """
    
    def __init__(self):
        self.data_sources = {
            "france_health": "https://www.data.gouv.fr/api/1",
            "who": "https://ghoapi.azureedge.net/api", 
            "fda": "https://api.fda.gov",
            "meteo_france": "https://www.infoclimat.fr/opendata/",
            "open_weather": "https://api.openweathermap.org/data/2.5",
            "sncf": "https://api.sncf.com/v1",
            "nutrition": "https://world.openfoodfacts.org/api/v0"
        }
        print("✅ Service données officielles étendu !")
    
    # ==================== 🌤️ MÉTÉO FRANCE ====================
    
    async def get_meteo_france_data(self, city: str = "Paris") -> Dict[str, Any]:
        """
        Données météo France via Infoclimat (données Météo France)
        """
        try:
            # Infoclimat utilise les données Météo France SYNOP
            url = f"https://www.infoclimat.fr/opendata/stations/france"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "source": "Infoclimat / Météo France",
                            "city": city,
                            "data_available": True,
                            "stations_count": len(data.get('stations', [])),
                            "note": "Données brutes Météo France accessibles"
                        }
                    else:
                        # Fallback sur OpenWeather (gratuit)
                        return await self._get_openweather_data(city)
                        
        except Exception as e:
            return await self._get_openweather_data(city)
    
    async def _get_openweather_data(self, city: str) -> Dict[str, Any]:
        """Fallback sur OpenWeather (gratuit sans API key pour les tests)"""
        try:
            url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid=demo&units=metric"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "source": "OpenWeatherMap",
                            "city": city,
                            "temperature": data['main']['temp'],
                            "description": data['weather'][0]['description'],
                            "humidity": data['main']['humidity'],
                            "updated": datetime.now().isoformat()
                        }
                    else:
                        return {"error": "Service météo temporairement indisponible"}
        except:
            return {"error": "Service météo indisponible"}
    
    # ==================== 🚄 TRANSPORTS SNCF ====================
    
    async def get_sncf_departures(self, station: str = "FRPAR") -> Dict[str, Any]:
        """
        Prochains départs SNCF (nécessite API key gratuite)
        """
        try:
            # SNCF OpenData - besoin d'une clé API gratuite
            url = f"https://api.sncf.com/v1/coverage/sncf/stop_areas/{station}/departures"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "source": "SNCF OpenData",
                            "station": station,
                            "departures_count": len(data.get('departures', [])),
                            "departures": data.get('departures', [])[:5]
                        }
                    else:
                        return {
                            "source": "SNCF OpenData", 
                            "note": "API key requise (gratuite sur https://data.sncf.com/)",
                            "station": station,
                            "demo_data": self._get_sncf_demo_data()
                        }
        except Exception as e:
            return {"error": f"Erreur SNCF API: {str(e)}"}
    
    def _get_sncf_demo_data(self):
        """Données de démonstration SNCF"""
        return [
            {"train": "TER 1234", "destination": "Lille", "time": "14:30", "status": "À l'heure"},
            {"train": "TGV 5678", "destination": "Marseille", "time": "14:45", "status": "À l'heure"},
            {"train": "TER 9012", "destination": "Rouen", "time": "15:00", "status": "Retard 5min"}
        ]
    
    # ==================== 🍎 NUTRITION ====================
    
    async def get_food_info(self, product_name: str) -> Dict[str, Any]:
        """
        Informations nutritionnelles depuis Open Food Facts
        Base mondiale collaborative - données réelles
        """
        try:
            url = f"https://world.openfoodfacts.org/api/v0/product/{product_name}.json"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('status') == 1:
                            product = data['product']
                            return {
                                "source": "Open Food Facts",
                                "product": product_name,
                                "found": True,
                                "brand": product.get('brands', 'Inconnu'),
                                "nutrition_grades": product.get('nutrition_grades', 'Inconnu'),
                                "calories": product.get('nutriments', {}).get('energy-kcal_100g', 'N/A'),
                                "ingredients": product.get('ingredients_text', 'Non disponible')[:200] + "..."
                            }
                        else:
                            return {
                                "source": "Open Food Facts", 
                                "product": product_name,
                                "found": False,
                                "message": "Produit non trouvé dans la base"
                            }
                    else:
                        return {"error": f"API nutrition indisponible: {response.status}"}
        except Exception as e:
            return {"error": f"Erreur API nutrition: {str(e)}"}
    
    # ==================== 🏥 SANTÉ (EXISTANT) ====================
    
    async def get_french_health_indicators(self) -> Dict[str, Any]:
        """Indicateurs santé français - data.gouv.fr"""
        # [Ton code existant...]
        pass
    
    async def get_who_global_data(self, indicator: str = "LIFE_0000000029") -> Dict[str, Any]:
        """Données OMS mondiales"""
        # [Ton code existant...] 
        pass
    
    async def get_covid_global_data(self) -> Dict[str, Any]:
        """Données COVID-19 mondiales"""
        # [Ton code existant...]
        pass

# Instance globale
official_health_service = OfficialHealthDataService()
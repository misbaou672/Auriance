"""Service NLP pour l'extraction d'informations et génération de JSON."""
import logging
import re
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class MedicalNLP:
    def extract_medical_info(self, text: str) -> Dict[str, Any]:
        """
        Extrait les infos médicales d'une transcription
        Exemple: "Patient Martin Dupont, 45 ans, fièvre à 38.5, toux sèche"
        """
        text_lower = text.lower()
        
        # 1. EXTRACTION DU NOM (CRITIQUE) - Robustesse améliorée
        nom = ""
        # Cherche "patient X Y", "monsieur X", "madame X", "enfant X"
        patterns_nom = [
            r"(?:patient|nom du patient|l'enfant|monsieur|madame|mme|mr)\.?\s+([a-zA-Zà-ÿÀ-Ÿ\-]+(?:\s+[a-zA-Zà-ÿÀ-Ÿ\-]+)?)", # "Patient Jean Dupont"
            r"s'appelle\s+([a-zA-Zà-ÿÀ-Ÿ\-]+(?:\s+[a-zA-Zà-ÿÀ-Ÿ\-]+)?)", # "S'appelle Jean"
            r"sujet\s+([a-zA-Zà-ÿÀ-Ÿ\-]+(?:\s+[a-zA-Zà-ÿÀ-Ÿ\-]+)?)",
        ]
        
        for pattern in patterns_nom:
            match = re.search(pattern, text_lower)
            if match:
                clean_name = match.group(1).strip()
                # Évite de capturer des mots communs comme "est", "a", "présente"
                if clean_name not in ["est", "a", "présente", "souffre", "vient"]:
                    nom = clean_name.title()
                    break
        
        # 2. EXTRACTION DE L'ÂGE (FACILE)
        age = ""
        # Accepte "45 ans", "45 on" (erreur ASR), "âgé de 45"
        age_match = re.search(r'(?:âgé\s+de\s+|age\s*:?\s*)?(\d{1,3})\s*(?:ans?|on|années?)', text_lower)
        if age_match:
            age = age_match.group(1)
        
        # 3. EXTRACTION DES SYMPTÔMES (LISTE)
        symptomes_list = []
        
        # Liste étendue des symptômes
        symptomes_connus = [
            "fièvre", "toux", "douleur", "nausée", "vomissement",
            "fatigue", "mal de tête", "migraine", "céphalée", "frisson", 
            "diarrhée", "essoufflement", "courbature", "gorge irritée",
            "nez qui coule", "éternuement", "douleur thoracique", "rhume",
            "mal au ventre", "douleur abdominale", "rougeur", "gonflement"
        ]
        
        for symptome in symptomes_connus:
            # Recherche simple de sous-chaîne pour être tolérant
            if symptome in text_lower:
                symptomes_list.append(symptome)
        
        symptomes = ", ".join(symptomes_list) if symptomes_list else ""
        
        # 4. EXTRACTION TEMPÉRATURE
        temperature = ""
        # Accepte 38, 38.5, 38,5, 38°
        temp_match = re.search(r'(\d{2}[,.]?\d?)\s*(?:°|degrés?|température)', text_lower)
        if temp_match:
            temperature = temp_match.group(1).replace(',', '.')

        # 5. EXTRACTION DIAGNOSTIC
        diagnostic = ""
        # Cherche explicitement "diagnostic :" ou des maladies connues
        diag_match = re.search(r'(?:diagnostic|conclusion|résultat)\s*:?\s*(?:est\s+)?([a-zA-Zà-ÿÀ-Ÿ\s]+?)(?:(?:\.|,)|$|je prescris)', text_lower)
        if diag_match:
             diagnostic = diag_match.group(1).strip()
        else:
            diagnostics_connus = ["grippe", "angine", "bronchite", "covid", "gastro obésité", "diabète", "hypertension"]
            for diag in diagnostics_connus:
                if diag in text_lower:
                    diagnostic = diag.capitalize()
                    break
        
        # 6. EXTRACTION MÉDICAMENT / TRAITEMENT
        medicament = ""
        # Patterns multiples pour capturer le traitement
        patterns_med = [
            r"(?:prescris|prescrire|ordonnance|donner|traitement|prendre)\s+(?:du|de la|le|les)?\s*([a-zA-Z0-9à-ÿÀ-Ÿ\s]+?)(?:(?:\.|,)|$|pendant)",
            r"(\w+)\s+(\d+\s*(?:mg|g|ml|cp|comprimés?))", # Doliprane 1000mg
        ]
        
        for pattern in patterns_med:
             med_match = re.search(pattern, text_lower)
             if med_match:
                 if len(med_match.groups()) > 1:
                     medicament = f"{med_match.group(1)} {med_match.group(2)}"
                 else:
                     medicament = med_match.group(1).strip()
                 break
        
        return {
            "nom_patient": nom,
            "age": age,
            "symptomes": symptomes,
            "temperature": temperature,
            "diagnostic": diagnostic,
            "medicament": medicament
        }

# ... (Previous MedicalNLP code remains the same, assuming we append) ...

class BiodiversityNLP:
    def extract_biodiversity_info(self, text: str) -> Dict[str, Any]:
        """
        Extrait les infos d'observation de biodiversité.
        Exemple: "J'ai vu 3 Mésanges bleues près du grand chêne, elles étaient en train de nidifier, beau soleil."
        """
        text_lower = text.lower()
        
        # 1. ESPÈCE
        espece = ""
        # Liste simplifiée pour démo, idéalement une base de données ou un NER
        especes_connues = [
            "mésange", "rouge-gorge", "aigle", "renard", "sanglier", "chevreuil", 
            "chêne", "hêtre", "fougère", "salamandre", "grenouille", "buse", "corbeau",
            "pie", "moineau", "pigeon", "hérisson", "écureuil"
        ]
        
        # Recherche explicite
        match_esp = re.search(r"(?:espèce|animal|vu)\s+(?:un|une|des|le|la|les)?\s*([a-zA-Zà-ÿÀ-Ÿ\-]+(?:\s+[a-zA-Zà-ÿÀ-Ÿ\-]+)?)", text_lower)
        if match_esp and match_esp.group(1).strip() not in ["un", "une", "des"]:
             espece = match_esp.group(1).strip().capitalize()
        
        # Recherche par mots clés connus si pas trouvé
        if not espece:
            for esp in especes_connues:
                if esp in text_lower:
                    espece = esp.capitalize()
                    break
                    
        # 2. NOMBRE / COMPTAGE
        nombre = ""
        match_nb = re.search(r"(\d+)\s*(?:individu|sujet|oiseau|animal|spécimen|mésange|renard)?", text_lower)
        if match_nb:
            nombre = match_nb.group(1)
        else:
            # Recherche textuelle simple
            chiffres = {"un": 1, "une": 1, "deux": 2, "trois": 3, "quatre": 4, "cinq": 5, "six": 6, "dix": 10}
            for word, val in chiffres.items():
                if f" {word} " in f" {text_lower} ":
                    nombre = str(val)
                    break
        
        # 3. LIEU / HABITAT
        lieu = ""
        match_lieu = re.search(r"(?:près\s+d.|à\s+côté\s+d.|dans\s+le|sur\s+le|au\s+niveau\s+d.)\s*([a-zA-Z0-9à-ÿÀ-Ÿ\s]+?)(?:(?:\.|,)|$|avec|et)", text_lower)
        if match_lieu:
            lieu = match_lieu.group(1).strip()
            
        # 4. COMPORTEMENT
        comportement = ""
        match_comp = re.search(r"(?:comportement|action|entrain\s+de)\s*([a-zA-Z0-9à-ÿÀ-Ÿ\s]+?)(?:(?:\.|,)|$)", text_lower)
        if match_comp:
            comportement = match_comp.group(1).strip()
        else:
            # Verbes d'action courants
            actions = ["manger", "dormir", "voler", "chasser", "nidifier", "chanter", "courir"]
            for action in actions:
                if action in text_lower:
                    comportement = action.capitalize()
                    break
        
        # 5. MÉTÉO
        meteo = ""
        meteo_keywords = ["soleil", "pluie", "nuage", "vent", "brouillard", "neige", "beau temps", "mauvais temps"]
        found_meteo = []
        for m in meteo_keywords:
            if m in text_lower:
                found_meteo.append(m)
        meteo = ", ".join(found_meteo).capitalize() if found_meteo else ""

        return {
            "espece": espece,
            "nombre": nombre,
            "lieu": lieu,
            "comportement": comportement,
            "meteo": meteo
        }

class ConstructionNLP:
    def extract_construction_info(self, text: str) -> Dict[str, Any]:
        """
        Extrait les infos de rapport chantier.
        Exemple: "Chantier Tour A, avancement 60%, blocage livraison béton, suite coulage dalle."
        """
        text_lower = text.lower()
        
        # 1. PROJET / CHANTIER
        projet = ""
        match_proj = re.search(r"(?:chantier|projet|site|bâtiment)\s+([a-zA-Z0-9à-ÿÀ-Ÿ\s]+?)(?:(?:\.|,)|$|avancement|état)", text_lower)
        if match_proj:
            projet = match_proj.group(1).strip().title()
            
        # 2. AVANCEMENT
        avancement = ""
        match_av = re.search(r"(\d+(?:\s?%|\s?pourcent))", text_lower)
        if match_av:
            avancement = match_av.group(1).replace(" ", "")
        
        # 3. PROBLÈME / BLOQUANT
        probleme = ""
        triggers_pb = ["problème", "bloquant", "retard", "souci", "alerte", "incident"]
        for trig in triggers_pb:
            match_pb = re.search(rf"{trig}\s*(?:de|sur|:)?\s*([a-zA-Z0-9à-ÿÀ-Ÿ\s]+?)(?:(?:\.|,)|$|action|suite)", text_lower)
            if match_pb:
                probleme = match_pb.group(1).strip()
                break
        if not probleme and "aucun problème" not in text_lower and "tout va bien" not in text_lower:
             pass # laisser vide
        elif "aucun problème" in text_lower:
             probleme = "Ras"

        # 4. PROCHAINE ÉTAPE
        suite = ""
        triggers_suite = ["prochaine étape", "suite", "action", "à faire", "prévoir"]
        for trig in triggers_suite:
            match_suite = re.search(rf"{trig}\s*(?::|est de)?\s*([a-zA-Z0-9à-ÿÀ-Ÿ\s]+?)(?:(?:\.|,)|$)", text_lower)
            if match_suite:
                suite = match_suite.group(1).strip()
                break

        # 5. DATE
        date_str = ""
        # Simple extraction jour/mois si mentionné
        return {
            "projet": projet,
            "avancement": avancement,
            "probleme": probleme,
            "suite": suite,
            "date": date_str # Souvent géré automatiquement par la date du jour
        }

# Instances globales
medical_nlp = MedicalNLP()
biodiv_nlp = BiodiversityNLP()
construction_nlp = ConstructionNLP()

class NLPService:
    async def extract_form_data(self, text: str, form_type: str = "medical") -> Dict[str, Any]:
        """Wrapper intelligent qui choisit le bon extracteur."""
        if form_type == "biodiversity" or form_type == "biodiversite":
            data = biodiv_nlp.extract_biodiversity_info(text)
            # Mapping standardisé pour l'affichage si besoin, ou brut
            # Le frontend s'adaptera aux clés retournées
            return data
            
        elif form_type == "construction" or form_type == "chantier":
            data = construction_nlp.extract_construction_info(text)
            return data
            
        else:
            # Par défaut : Médical
            data = medical_nlp.extract_medical_info(text)
            return {
                "nom": data["nom_patient"],
                "age": data["age"],
                "symptomes": data["symptomes"],
                "temperature": data["temperature"],
                "diagnostic": data["diagnostic"],
                "traitement": data["medicament"],
                "prenom": "",
                "genre": ""
            }

    # Legacy wrapper compatibility
    async def extract_medical_form_fields(self, text: str) -> Dict[str, Any]:
        return await self.extract_form_data(text, "medical")

    async def generate_form_json(self, text: str, form_schema: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return await self.extract_form_data(text, "medical")

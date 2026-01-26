"""Service pour générer des requêtes SQL et Cypher."""
import logging
import re
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)


class QueryGenerationService:
    """Génère des requêtes SQL et Cypher à partir du texte."""
    
    # Mapping des mots clés aux opérations SQL
    ACTION_MAPPING = {
        "afficher": "SELECT", "show": "SELECT", "display": "SELECT", "lister": "SELECT", "donne": "SELECT", "donnez": "SELECT",
        "créer": "INSERT", "create": "INSERT", "new": "INSERT",
        "modifier": "UPDATE", "update": "UPDATE", "change": "UPDATE",
        "supprimer": "DELETE", "delete": "DELETE", "remove": "DELETE",
        "compter": "SELECT COUNT", "chercher": "SELECT", "search": "SELECT", "find": "SELECT"
    }
    
    # Mapping des mots aux tables
    TABLE_MAPPING = {
        # General
        "projet": "projects", "projects": "projects",
        "utilisateur": "users", "user": "users", "users": "users",
        # Medical
        "patient": "patients", "patients": "patients",
        "consultation": "consultations", "consultations": "consultations",
        "symptome": "consultations", "symptomes": "consultations" # Raccourci vers consultas
    }
    
    async def generate_sql(
        self,
        intent: str,
        extracted_fields: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        try:
            logger.info(f"Génération SQL pour: {intent}")
            intent_lower = intent.lower()
            
            action = self._get_action(intent_lower)
            table = self._get_table(intent_lower)
            filters = self._extract_filters(intent_lower, extracted_fields)
            
            # Logique spéciale pour les recherches médicales (Patients/Symptomes/Dates)
            if table == "patients" and any(f['field'] == 'symptomes' for f in filters):
                # Si on cherche des patients avec des symptômes, on doit joindre avec consultations
                query = self._build_medical_join_query(filters)
            elif action == "SELECT":
                query = self._build_select(table, filters)
            elif action == "INSERT":
                query = self._build_insert(table, extracted_fields)
            elif action == "UPDATE":
                query = self._build_update(table, extracted_fields, filters)
            elif action == "DELETE":
                query = self._build_delete(table, filters)
            else:
                query = f"SELECT * FROM {table} LIMIT 100"
            
            logger.info(f"✅ SQL généré: {query}")
            return {"action": action, "table": table, "filters": filters, "query": query, "confidence": 0.85}
        except Exception as e:
            logger.error(f"❌ Erreur SQL: {e}")
            return {"error": str(e)}
    
    async def generate_cypher(
        self,
        intent: str,
        extracted_fields: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        try:
            logger.info(f"Génération Cypher pour: {intent}")
            intent_lower = intent.lower()
            
            # Analyse simple pour démo médicale
            symptome_filter = next((f['value'] for f in self._extract_filters(intent_lower, {}) if f['field'] == 'symptomes'), None)
            year_filter = next((f['value'] for f in self._extract_filters(intent_lower, {}) if f['field'] == 'year'), None)

            if symptome_filter:
                # Mode Médical Avancé : Patient -> Consultation -> Symptome
                query = (
                    f"MATCH (p:Patient)-[:A_CONSULTE]->(c:Consultation) "
                    f"WHERE toLower(c.symptomes) CONTAINS '{symptome_filter}' "
                )
                if year_filter:
                    query += f"AND c.date >= date('{year_filter}-01-01') "
                
                query += "RETURN p.nom, p.prenom, c.date, c.symptomes LIMIT 50"
            else:
                # Fallback générique
                node_type = self._get_node_type(intent_lower)
                relation = self._get_relation(intent_lower)
                query = f"MATCH (n:{node_type}) RETURN n LIMIT 25"
            
            logger.info(f"✅ Cypher généré: {query}")
            return {"query": query, "confidence": 0.80}
        except Exception as e:
            logger.error(f"❌ Erreur Cypher: {e}")
            return {"error": str(e)}
            
    def _build_medical_join_query(self, filters: List[Dict]) -> str:
        """Construit une requête SQL JOIN pour Patient <-> Consultation."""
        conditions = []
        for f in filters:
            if f['field'] == 'symptomes':
                conditions.append(f"c.symptomes LIKE '%{f['value']}%'")
            elif f['field'] == 'year':
                conditions.append(f"c.date >= '{f['value']}-01-01'")
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        return (
            f"SELECT p.nom, p.age, c.date, c.symptomes "
            f"FROM patients p "
            f"JOIN consultations c ON p.id = c.patient_id "
            f"WHERE {where_clause} "
            f"ORDER BY c.date DESC LIMIT 50"
        )

    def _get_action(self, text: str) -> str:
        for keyword, action in self.ACTION_MAPPING.items():
            if keyword in text: return action
        return "SELECT"
    
    def _get_table(self, text: str) -> str:
        for keyword, table in self.TABLE_MAPPING.items():
            if keyword in text: return table
        
        # Heuristique pour 'consultations' par défaut si jargon médical
        if any(w in text for w in ['fièvre', 'grippe', 'toux']):
            return 'consultations'
        return "patients" # Default safe
    
    def _get_node_type(self, text: str) -> str:
        if "patient" in text: return "Patient"
        if "consultation" in text: return "Consultation"
        if "projet" in text: return "Project"
        return "Node"

    def _get_relation(self, text: str) -> str:
        return "RELATED_TO"

    def _extract_filters(self, text: str, extracted: Dict) -> List[Dict]:
        filters = []
        
        # 1. Symptômes (via mots clés)
        med_keywords = ["fièvre", "fever", "toux", "migraine", "grippe", "douleur", "fatigue"]
        for kw in med_keywords:
            if kw in text:
                filters.append({"field": "symptomes", "operator": "LIKE", "value": kw})
        
        # 2. Année (ex: 2024, 2025)
        import re
        years = re.findall(r"\b202[0-9]\b", text)
        if years:
            filters.append({"field": "year", "operator": ">=", "value": years[0]})
            
        return filters

    def _build_select(self, table: str, filters: List[Dict]) -> str:
        query = f"SELECT * FROM {table}"
        if filters:
            conds = []
            for f in filters:
                if f['field'] == 'symptomes' and table == 'consultations':
                     conds.append(f"symptomes LIKE '%{f['value']}%'")
                elif f['field'] == 'year' and table == 'consultations':
                     conds.append(f"date >= '{f['value']}-01-01'")
                else: 
                     # Generic fallback
                     conds.append(f"id IS NOT NULL") # Dummy
            if conds:
                query += " WHERE " + " AND ".join(conds)
        return query + " LIMIT 100"

    def _build_insert(self, table, fields): return f"INSERT INTO {table} DEFAULT VALUES"
    def _build_update(self, table, fields, filters): return f"UPDATE {table} SET updated_at=NOW()"
    def _build_delete(self, table, filters): return f"DELETE FROM {table}"

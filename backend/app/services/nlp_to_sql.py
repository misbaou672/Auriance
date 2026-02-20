"""Convert natural language questions to SQL using Gemini."""
import logging
import json
from typing import Dict, Any
from app.services.gemini_client import gemini_client
from app.services.db_schema_service import db_schema_service
from app.services.query_executor import query_executor

logger = logging.getLogger(__name__)


class NlpToSqlService:
    """Converts natural language questions into SQL queries and executes them."""

    async def process_question(self, question: str, language: str = "fr") -> Dict[str, Any]:
        schema = db_schema_service.get_schema_description()
        sql_result = await self._generate_sql(question, schema)

        if "error" in sql_result:
            return sql_result

        sql_query = sql_result.get("sql", "")
        if not sql_query:
            return {"error": "No SQL generated", "question": question}

        execution_result = query_executor.execute(sql_query)
        if execution_result.get("error"):
            return {
                "question": question,
                "sql_generated": sql_query,
                "error": execution_result["error"],
                "results": {"rows": [], "columns": []},
                "interpretation": f"Erreur d'execution: {execution_result['error']}",
            }

        interpretation = await self._interpret_results(
            question, sql_query, execution_result, language
        )

        return {
            "question": question,
            "sql_generated": sql_query,
            "results": execution_result,
            "interpretation": interpretation,
        }

    async def _generate_sql(self, question: str, schema: str) -> Dict[str, Any]:
        system_prompt = (
            "Tu es un expert SQL. A partir d'un schema de base de donnees et d'une question "
            "en langage naturel, genere une requete SQL SELECT valide pour SQLite. "
            "Genere UNIQUEMENT des SELECT. Jamais INSERT, UPDATE, DELETE, DROP. "
            "Reponds en JSON avec les cles: sql (la requete), explanation (explication courte).\n\n"
            f"Schema de la base de donnees:\n{schema}"
        )

        try:
            result = await gemini_client.chat_json(
                system_prompt=system_prompt,
                user_message=f"Question: {question}",
                model=gemini_client.model_smart,
            )
            return result
        except Exception as e:
            logger.error(f"SQL generation error: {e}")
            return {"error": str(e)}

    async def _interpret_results(
        self, question: str, sql: str, results: Dict, language: str
    ) -> str:
        rows_preview = json.dumps(
            results.get("rows", [])[:10], ensure_ascii=False, default=str
        )

        system_prompt = (
            f"Tu es un analyste de donnees medicales. Reponds en "
            f"{'francais' if language == 'fr' else 'anglais'}. "
            "A partir d'une question, du SQL utilise et des resultats, "
            "fournis un resume clair et concis en langage naturel."
        )

        user_msg = (
            f"Question: {question}\n"
            f"SQL: {sql}\n"
            f"Resultats ({results.get('row_count', 0)} lignes): {rows_preview}"
        )

        try:
            return await gemini_client.chat(
                system_prompt=system_prompt,
                user_message=user_msg,
                model=gemini_client.model_fast,
            )
        except Exception as e:
            return f"Interpretation indisponible: {e}"


nlp_to_sql_service = NlpToSqlService()

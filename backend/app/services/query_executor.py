"""Safe SQL executor - only allows SELECT queries with validation."""
import logging
import re
from typing import Dict, Any
from sqlalchemy import text
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

FORBIDDEN_KEYWORDS = [
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE",
    "TRUNCATE", "EXEC", "EXECUTE", "GRANT", "REVOKE",
    "ATTACH", "DETACH",
]

MAX_ROWS = 100


class QueryExecutor:
    """Executes validated SELECT-only SQL queries against the database."""

    def validate_query(self, sql: str) -> tuple:
        sql_upper = sql.strip().upper()

        if not (sql_upper.startswith("SELECT") or sql_upper.startswith("WITH")):
            return False, "Only SELECT queries are allowed"

        for keyword in FORBIDDEN_KEYWORDS:
            pattern = r"\b" + re.escape(keyword) + r"\b"
            if re.search(pattern, sql_upper):
                return False, f"Forbidden keyword detected: {keyword}"

        cleaned = re.sub(r"'[^']*'", "", sql)
        cleaned = re.sub(r'"[^"]*"', "", cleaned)
        if ";" in cleaned:
            return False, "Multiple statements not allowed"

        return True, "OK"

    def execute(self, sql: str) -> Dict[str, Any]:
        is_valid, reason = self.validate_query(sql)
        if not is_valid:
            return {"error": reason, "rows": [], "columns": []}

        sql_upper = sql.strip().upper()
        if "LIMIT" not in sql_upper:
            sql = sql.rstrip().rstrip(";") + f" LIMIT {MAX_ROWS}"

        try:
            db = SessionLocal()
            try:
                result = db.execute(text(sql))
                columns = list(result.keys())
                rows = [dict(zip(columns, row)) for row in result.fetchall()]
                return {
                    "columns": columns,
                    "rows": rows,
                    "row_count": len(rows),
                    "query": sql,
                }
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Query execution error: {e}")
            return {"error": str(e), "rows": [], "columns": []}


query_executor = QueryExecutor()

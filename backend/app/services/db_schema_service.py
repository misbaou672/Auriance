"""Service to introspect the database schema for NL-to-SQL."""
import logging
from sqlalchemy import inspect
from app.db.session import engine

logger = logging.getLogger(__name__)


class DbSchemaService:
    """Introspects the SQLAlchemy database to produce a schema description."""

    def get_schema_description(self) -> str:
        """Return a human-readable schema for use in LLM prompts."""
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        schema_parts = []

        for table_name in tables:
            columns = inspector.get_columns(table_name)
            col_descriptions = []
            for col in columns:
                nullable = "" if col.get("nullable", True) else " NOT NULL"
                col_descriptions.append(f"  {col['name']} {col['type']}{nullable}")

            fks = inspector.get_foreign_keys(table_name)
            fk_descriptions = []
            for fk in fks:
                fk_descriptions.append(
                    f"  FOREIGN KEY ({', '.join(fk['constrained_columns'])}) "
                    f"REFERENCES {fk['referred_table']}({', '.join(fk['referred_columns'])})"
                )

            all_lines = col_descriptions + fk_descriptions
            schema_parts.append(
                f"TABLE {table_name} (\n" + ",\n".join(all_lines) + "\n)"
            )

        return "\n\n".join(schema_parts)

    def get_table_names(self) -> list:
        inspector = inspect(engine)
        return inspector.get_table_names()

    def get_schema_dict(self) -> dict:
        """Return schema as a structured dictionary."""
        inspector = inspect(engine)
        result = {}
        for table_name in inspector.get_table_names():
            columns = inspector.get_columns(table_name)
            result[table_name] = [
                {
                    "name": c["name"],
                    "type": str(c["type"]),
                    "nullable": c.get("nullable", True),
                }
                for c in columns
            ]
        return result


db_schema_service = DbSchemaService()

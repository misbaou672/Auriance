"""Migration script: Add Assistant Medical columns to transcriptions table."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import engine
from sqlalchemy import text, inspect


def migrate():
    inspector = inspect(engine)
    existing_columns = [col["name"] for col in inspector.get_columns("transcriptions")]

    new_columns = {
        "patient_id": "INTEGER",
        "resume_ia": "TEXT",
        "points_cles": "TEXT",
        "entites_detectees": "TEXT",
        "type_session": "VARCHAR(50)",
        "priorite": "VARCHAR(20)",
        "analysee": "BOOLEAN DEFAULT 0",
    }

    with engine.connect() as conn:
        for col_name, col_type in new_columns.items():
            if col_name not in existing_columns:
                conn.execute(
                    text(f"ALTER TABLE transcriptions ADD COLUMN {col_name} {col_type}")
                )
                print(f"  Added column: {col_name}")
            else:
                print(f"  Column already exists: {col_name}")
        conn.commit()
    print("Migration complete.")


if __name__ == "__main__":
    migrate()

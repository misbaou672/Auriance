"""Seed minimal Postgres data so the multi-DB demo always returns at least 1 hit.

It targets the schema created by backend/app/core/database.py:
- medecins(email, password_hash, ...)
- patients(medecin_id, prenom, nom, ...)
- consultations(patient_id, medecin_id, date_consultation, transcription_audio, notes_medicales, ...)

Usage:
    C:/Users/marec/Documents/auriance/backend/aurian_env/Scripts/python.exe seed_postgres_demo_data.py

DB URL is read from env DATABASE_URL, falling back to backend/app/core/config.py default.
"""

from __future__ import annotations

import os

import psycopg2


DEFAULT_DB_URL = "postgresql://postgres:110603@localhost:5432/auriance_medical"


def main() -> int:
    db_url = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

    conn = psycopg2.connect(db_url)
    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            # 1) Ensure a doctor exists
            cur.execute("SELECT id FROM medecins ORDER BY id ASC LIMIT 1")
            row = cur.fetchone()
            if row:
                medecin_id = int(row[0])
            else:
                cur.execute(
                    """
                    INSERT INTO medecins (email, password_hash, prenom, nom, specialite, numero_rpps)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        "demo@auriance.local",
                        "demo",
                        "Demo",
                        "Medecin",
                        "Generaliste",
                        "DEMO-RPPS-0001",
                    ),
                )
                medecin_id = int(cur.fetchone()[0])

            # 2) Ensure a patient exists
            prenom = "Jean"
            nom = "Dupont"
            cur.execute(
                """
                SELECT id FROM patients
                WHERE prenom = %s AND nom = %s
                ORDER BY id ASC
                LIMIT 1
                """,
                (prenom, nom),
            )
            row = cur.fetchone()
            if row:
                patient_id = int(row[0])
            else:
                cur.execute(
                    """
                    INSERT INTO patients (medecin_id, prenom, nom, genre)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                    """,
                    (medecin_id, prenom, nom, "Homme"),
                )
                patient_id = int(cur.fetchone()[0])

            # 3) Ensure a consultation with fever exists
            marker = "fièvre"
            cur.execute(
                """
                SELECT id FROM consultations
                WHERE patient_id = %s
                  AND (notes_medicales ILIKE %s OR transcription_audio ILIKE %s)
                ORDER BY id DESC
                LIMIT 1
                """,
                (patient_id, f"%{marker}%", f"%{marker}%"),
            )
            row = cur.fetchone()
            if row:
                consultation_id = int(row[0])
                created = False
            else:
                cur.execute(
                    """
                    INSERT INTO consultations (
                        medecin_id,
                        patient_id,
                        transcription_audio,
                        notes_medicales,
                        statut,
                        langue_detectee,
                        confiance_transcription
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        medecin_id,
                        patient_id,
                        "Le patient présente une fièvre à 38.5 et une toux sèche.",
                        "Suspicion de grippe. Symptômes: fièvre, fatigue.",
                        "valide",
                        "fr",
                        0.9,
                    ),
                )
                consultation_id = int(cur.fetchone()[0])
                created = True

        conn.commit()
        print(
            f"OK: medecin_id={medecin_id} patient_id={patient_id} consultation_id={consultation_id} created={created}"
        )
        return 0

    except Exception as e:
        conn.rollback()
        print(f"Seed failed: {e}")
        return 1
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())

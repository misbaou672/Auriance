
import sqlite3
import os
from datetime import datetime, timedelta
import random

def inject_data_sqlite():
    db_path = "auriance.db"
    if not os.path.exists(db_path):
        if os.path.exists("app/auriance.db"):
            db_path = "app/auriance.db"
        else:
            print(f"❌ Base de données not found at {os.getcwd()}/auriance.db")
            return

    print(f"💉 Injection données dans {db_path} via sqlite3...")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    def get_columns(table):
        c.execute(f"PRAGMA table_info({table})")
        return {r[1] for r in c.fetchall()}

    try:
        tables_res = c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in tables_res.fetchall()]
        print(f"DEBUG: Tables existantes: {tables}")

        # Ensure tables exist
        if 'users' not in tables:
            print("❌ Table 'users' manquante. Création...")
            c.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR UNIQUE,
                hashed_password VARCHAR,
                full_name VARCHAR,
                username VARCHAR UNIQUE,
                role VARCHAR DEFAULT 'patient',
                language VARCHAR DEFAULT 'fr',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME
            )
            """)
        
        if 'patients' not in tables:
            print("⚠️ Table 'patients' manquante. Création...")
            c.execute("""
            CREATE TABLE patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom VARCHAR,
                age INTEGER,
                user_id INTEGER,
                created_at DATETIME,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """)
            tables.append('patients')

        if 'consultations' not in tables:
            print("⚠️ Table 'consultations' manquante. Création...")
            c.execute("""
            CREATE TABLE consultations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER,
                medecin_id INTEGER,
                date DATETIME,
                transcription TEXT,
                symptomes TEXT,
                diagnostic TEXT,
                traitement TEXT,
                nom_snapshot VARCHAR,
                age_snapshot INTEGER,
                genre_snapshot VARCHAR,
                FOREIGN KEY(patient_id) REFERENCES patients(id),
                FOREIGN KEY(medecin_id) REFERENCES users(id)
            )
            """)
            tables.append('consultations')

        # 1. Medecin
        user_cols = get_columns('users')
        
        c.execute("SELECT id FROM users WHERE email='demo@auriance.com'")
        row = c.fetchone()
        if row:
            medecin_id = row[0]
            print(f"ℹ️ Medecin ID: {medecin_id}")
        else:
            fake_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6kqz.M0/.6k.1.1"
            now = datetime.utcnow().isoformat()
            
            fields = {'email': 'demo@auriance.com', 'hashed_password': fake_hash, 'full_name': 'Dr. Auriance Demo', 'is_active': 1, 'created_at': now}
            if 'role' in user_cols: fields['role'] = 'medecin'
            if 'language' in user_cols: fields['language'] = 'fr'
            if 'username' in user_cols: fields['username'] = 'demo_doctor'
            
            keys = ", ".join(fields.keys())
            placeholders = ", ".join(["?"] * len(fields))
            values = tuple(fields.values())
            
            c.execute(f"INSERT INTO users ({keys}) VALUES ({placeholders})", values)
            medecin_id = c.lastrowid
            print(f"✅ Medecin créé ID: {medecin_id}")

        # 2. Patients
        patient_cols = get_columns('patients')
        
        patients_data = [
            ("Dupont Jean", 45), ("Martin Sophie", 32), ("Bernard Michel", 67),
            ("Dubois Marie", 29), ("Thomas Pierre", 54), ("Robert Julie", 41),
            ("Richard Lucas", 12), ("Petit Emma", 8), ("Durand Alain", 75),
            ("Leroy Claire", 63)
        ]
        
        patient_ids = []
        now = datetime.utcnow().isoformat()
        
        for name, age in patients_data:
            c.execute("SELECT id FROM patients WHERE nom=?", (name,))
            row = c.fetchone()
            if row:
                patient_ids.append(row[0])
            else:
                fields = {'nom': name, 'age': age, 'created_at': now}
                if 'user_id' in patient_cols: fields['user_id'] = medecin_id
                
                keys = ", ".join(fields.keys())
                placeholders = ", ".join(["?"] * len(fields))
                values = tuple(fields.values())
                
                c.execute(f"INSERT INTO patients ({keys}) VALUES ({placeholders})", values)
                patient_ids.append(c.lastrowid)
        
        print(f"✅ {len(patient_ids)} patients prêts.")

        # 3. Consultations
        cons_cols = get_columns('consultations')
        
        symptomes_list = [
            "Fièvre élevée, toux sèche", "Maux de tête persistants, migraine",
            "Douleur abdominale, nausées", "Fatigue chronique, vertiges",
            "Douleur thoracique, essoufflement", "Éruption cutanée, démangeaisons",
            "Douleur articulaire genou droit", "Mal de gorge, difficultés à avaler",
            "Lumbago, douleur bas du dos", "Insomnie, anxiété"
        ]
        diagnostics_list = [
            "Syndrome grippal probable", "Migraine ophtalmique",
            "Gastro-entérite virale", "Anémie ferriprive",
            "Bronchite aiguë", "Eczéma de contact",
            "Arthrose débutante", "Angine bactérienne",
            "Lombalgie commune", "Trouble anxieux généralisé"
        ]
        traitements_list = [
            "Paracétamol 1g, Repos", "Triptans si crise, Ibuprofène",
            "Spasfon, Diète hydrique", "Supplémentation Fer, Bilan sanguin",
            "Antibiotiques (Amoxicilline), Sirop", "Crème corticoïde, Antihistaminique",
            "Kinésithérapie, Antalgiques", "Antibiotiques, Spray gorge",
            "Repos, Kinésithérapie, Antalgiques", "Thérapie comportementale, Phytothérapie"
        ]

        count = 0
        start_date_2025 = datetime(2025, 1, 1)
        end_date_2026 = datetime(2026, 12, 31)
        delta_days = (end_date_2026 - start_date_2025).days

        for _ in range(50):
            pid = random.choice(patient_ids)
            idx = random.randint(0, len(symptomes_list) - 1)
            
            random_days = random.randint(0, delta_days)
            cons_date = start_date_2025 + timedelta(days=random_days)
            cons_date_str = cons_date.isoformat()

            c.execute("SELECT nom, age FROM patients WHERE id=?", (pid,))
            p_nom, p_age = c.fetchone()

            trans = f"Consultation du {cons_date.strftime('%d/%m/%Y')}. Patient {p_nom}, {p_age} ans. Présente: {symptomes_list[idx]}."

            fields = {
                'patient_id': pid,
                'date': cons_date_str,
                'transcription': trans,
                'symptomes': symptomes_list[idx],
                'diagnostic': diagnostics_list[idx],
                'traitement': traitements_list[idx]
            }
            if 'medecin_id' in cons_cols: fields['medecin_id'] = medecin_id
            if 'nom_snapshot' in cons_cols: fields['nom_snapshot'] = p_nom
            if 'age_snapshot' in cons_cols: fields['age_snapshot'] = p_age

            keys = ", ".join(fields.keys())
            placeholders = ", ".join(["?"] * len(fields))
            values = tuple(fields.values())

            c.execute(f"INSERT INTO consultations ({keys}) VALUES ({placeholders})", values)
            count += 1
        
        conn.commit()
        print(f"✅ {count} Consultations injectées pour 2025-2026 (SQLite direct)")

    except Exception as e:
        print(f"❌ Erreur SQLite: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    inject_data_sqlite()

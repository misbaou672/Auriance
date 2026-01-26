"""
Script pour peupler les 3 bases de données (PostgreSQL, Neo4j, Qdrant)
avec les données générées par Synthea
"""
import pandas as pd
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from datetime import datetime
import json

def load_synthea_data():
    """Charge les données CSV de Synthea"""
    print("📥 Chargement des données Synthea...")
    
    csv_dir = Path("synthea/output/csv")
    
    if not csv_dir.exists():
        print("❌ Dossier Synthea non trouvé")
        print("Exécutez d'abord: python scripts/generate_patients.py")
        return None
    
    data = {}
    
    # Fichiers principaux à charger
    files_to_load = {
        'patients': 'patients.csv',
        'conditions': 'conditions.csv',
        'encounters': 'encounters.csv',
        'medications': 'medications.csv',
        'observations': 'observations.csv',
    }
    
    for key, filename in files_to_load.items():
        filepath = csv_dir / filename
        if filepath.exists():
            df = pd.read_csv(filepath)
            data[key] = df
            print(f"  ✅ {key}: {len(df)} lignes")
        else:
            print(f"  ⚠️  {filename} non trouvé")
    
    return data

def populate_postgresql(data):
    """Peuple PostgreSQL avec les patients et consultations"""
    print("\n" + "=" * 60)
    print("PEUPLEMENT POSTGRESQL")
    print("=" * 60)
    
    # Connexion à la base
    # TODO: Adapter l'URL de connexion à votre configuration
    db_url = "sqlite:///./data/auriance.db"  # Par défaut SQLite
    # db_url = "postgresql://user:password@localhost:5432/auriance"  # Pour PostgreSQL
    
    print(f"\n📡 Connexion à: {db_url}")
    
    try:
        engine = create_engine(db_url)
        
        # Créer les tables si elles n'existent pas
        with engine.begin() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS patients (
                    id VARCHAR(255) PRIMARY KEY,
                    birthdate DATE,
                    deathdate DATE,
                    gender VARCHAR(10),
                    race VARCHAR(50),
                    ethnicity VARCHAR(50),
                    city VARCHAR(100),
                    state VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS consultations (
                    id VARCHAR(255) PRIMARY KEY,
                    patient_id VARCHAR(255),
                    start_date TIMESTAMP,
                    stop_date TIMESTAMP,
                    encounter_class VARCHAR(50),
                    code VARCHAR(50),
                    description TEXT,
                    reasoncode VARCHAR(50),
                    reasondescription TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (patient_id) REFERENCES patients(id)
                )
            """))
            
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS conditions_diagnoses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id VARCHAR(255),
                    encounter_id VARCHAR(255),
                    start_date DATE,
                    stop_date DATE,
                    code VARCHAR(50),
                    description TEXT,
                    FOREIGN KEY (patient_id) REFERENCES patients(id)
                )
            """))
        
        print("✅ Tables créées")
        
        # Insérer les patients
        if 'patients' in data:
            patients_df = data['patients'][['Id', 'BIRTHDATE', 'DEATHDATE', 'GENDER', 'RACE', 'ETHNICITY', 'CITY', 'STATE']].copy()
            patients_df.columns = ['id', 'birthdate', 'deathdate', 'gender', 'race', 'ethnicity', 'city', 'state']
            
            patients_df.to_sql('patients', engine, if_exists='append', index=False)
            print(f"✅ Patients insérés: {len(patients_df)}")
        
        # Insérer les consultations
        if 'encounters' in data:
            encounters_df = data['encounters'][['Id', 'PATIENT', 'START', 'STOP', 'ENCOUNTERCLASS', 'CODE', 'DESCRIPTION', 'REASONCODE', 'REASONDESCRIPTION']].copy()
            encounters_df.columns = ['id', 'patient_id', 'start_date', 'stop_date', 'encounter_class', 'code', 'description', 'reasoncode', 'reasondescription']
            
            encounters_df.to_sql('consultations', engine, if_exists='append', index=False)
            print(f"✅ Consultations insérées: {len(encounters_df)}")
        
        # Insérer les diagnostics
        if 'conditions' in data:
            conditions_df = data['conditions'][['PATIENT', 'ENCOUNTER', 'START', 'STOP', 'CODE', 'DESCRIPTION']].copy()
            conditions_df.columns = ['patient_id', 'encounter_id', 'start_date', 'stop_date', 'code', 'description']
            
            conditions_df.to_sql('conditions_diagnoses', engine, if_exists='append', index=False)
            print(f"✅ Diagnostics insérés: {len(conditions_df)}")
        
        print("\n✅ PostgreSQL peuplé avec succès")
        return True
        
    except Exception as e:
        print(f"❌ Erreur PostgreSQL: {e}")
        return False

def populate_neo4j(data):
    """Peuple Neo4j avec le graphe médical"""
    print("\n" + "=" * 60)
    print("PEUPLEMENT NEO4J")
    print("=" * 60)
    
    try:
        from neo4j import GraphDatabase
        
        # TODO: Adapter à votre configuration Neo4j
        uri = "bolt://localhost:7687"
        user = "neo4j"
        password = "password"
        
        print(f"\n📡 Connexion à Neo4j: {uri}")
        
        driver = GraphDatabase.driver(uri, auth=(user, password))
        
        with driver.session() as session:
            # Créer les contraintes
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (p:Patient) REQUIRE p.id IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (c:Condition) REQUIRE c.code IS UNIQUE")
            
            # Créer les patients
            if 'patients' in data:
                for _, patient in data['patients'].iterrows():
                    session.run("""
                        MERGE (p:Patient {id: $id})
                        SET p.gender = $gender,
                            p.birthdate = $birthdate
                    """, id=patient['Id'], gender=patient['GENDER'], birthdate=str(patient['BIRTHDATE']))
                
                print(f"✅ Patients créés: {len(data['patients'])}")
            
            # Créer les conditions et relations
            if 'conditions' in data:
                condition_codes = data['conditions']['CODE'].unique()
                
                for code in condition_codes[:1000]:  # Limiter pour la démo
                    cond_data = data['conditions'][data['conditions']['CODE'] == code].iloc[0]
                    session.run("""
                        MERGE (c:Condition {code: $code})
                        SET c.description = $description
                    """, code=code, description=cond_data['DESCRIPTION'])
                
                print(f"✅ Conditions créées: {min(len(condition_codes), 1000)}")
                
                # Créer les relations Patient-[HAS_CONDITION]->Condition
                for _, condition in data['conditions'].head(5000).iterrows():  # Limiter pour performance
                    session.run("""
                        MATCH (p:Patient {id: $patient_id})
                        MATCH (c:Condition {code: $code})
                        MERGE (p)-[r:HAS_CONDITION]->(c)
                        SET r.start_date = $start_date
                    """, patient_id=condition['PATIENT'], code=condition['CODE'], start_date=str(condition['START']))
                
                print("✅ Relations créées")
        
        driver.close()
        print("\n✅ Neo4j peuplé avec succès")
        return True
        
    except ImportError:
        print("⚠️  Module neo4j non installé")
        print("   Installez avec: pip install neo4j")
        return False
    except Exception as e:
        print(f"❌ Erreur Neo4j: {e}")
        print("   Assurez-vous que Neo4j est démarré")
        return False

def populate_qdrant(data):
    """Peuple Qdrant avec les embeddings de conditions"""
    print("\n" + "=" * 60)
    print("PEUPLEMENT QDRANT")
    print("=" * 60)
    
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.models import Distance, VectorParams, PointStruct
        from sentence_transformers import SentenceTransformer
        
        print("\n📡 Connexion à Qdrant...")
        client = QdrantClient("localhost", port=6333)
        
        # Créer la collection
        collection_name = "medical_conditions"
        
        try:
            client.delete_collection(collection_name)
        except:
            pass
        
        print("🔧 Chargement du modèle d'embedding...")
        model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
        
        # Préparer les données
        if 'conditions' in data:
            conditions = data['conditions']['DESCRIPTION'].unique()[:1000]  # 1000 conditions uniques
            
            print(f"🔄 Embedding de {len(conditions)} conditions...")
            vectors = model.encode(conditions.tolist(), show_progress_bar=True)
            
            # Créer les points
            points = [
                PointStruct(
                    id=idx,
                    vector=vector.tolist(),
                    payload={"text": condition}
                )
                for idx, (condition, vector) in enumerate(zip(conditions, vectors))
            ]
            
            # Uploader par batch
            batch_size = 100
            for i in range(0, len(points), batch_size):
                batch = points[i:i+batch_size]
                client.upsert(collection_name=collection_name, points=batch)
                print(f"  📤 Uploaded {min(i+batch_size, len(points))}/{len(points)}")
            
            print(f"✅ Qdrant peuplé: {len(conditions)} vecteurs")
            return True
            
    except ImportError:
        print("⚠️  Modules manquants")
        print("   Installez avec: pip install qdrant-client sentence-transformers")
        return False
    except Exception as e:
        print(f"❌ Erreur Qdrant: {e}")
        print("   Assurez-vous que Qdrant est démarré")
        return False

def main():
    """Point d'entrée principal"""
    print("=" * 60)
    print("PEUPLEMENT DES BASES DE DONNÉES AURIANCE")
    print("=" * 60)
    
    # Charger les données Synthea
    data = load_synthea_data()
    
    if data is None:
        return False
    
    # Peupler chaque base
    results = {
        'PostgreSQL': populate_postgresql(data),
        'Neo4j': populate_neo4j(data),
        'Qdrant': populate_qdrant(data)
    }
    
    # Résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ")
    print("=" * 60)
    for db, success in results.items():
        status = "✅ OK" if success else "❌ Échec"
        print(f"{db}: {status}")
    
    all_success = all(results.values())
    
    if all_success:
        print("\n🎉 Toutes les bases de données ont été peuplées avec succès !")
    else:
        print("\n⚠️  Certaines bases n'ont pas pu être peuplées")
    
    return all_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

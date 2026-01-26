import sqlite3
import random
from datetime import datetime, timedelta
import os

# Configuration
DB_PATH = "auriance.db"

def init_domain_tables(cursor):
    """Crée les tables pour les différents domaines"""
    
    # --- DOMAINE ÉDUCATION ---
    print("📚 Création du schéma Éducation...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS etudiants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT,
        prenom TEXT,
        classe TEXT,
        moyenne REAL,
        absences INTEGER
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matiere TEXT,
        enseignant TEXT,
        salle TEXT,
        horaire TEXT
    )
    """)

    # --- DOMAINE ADMINISTRATIF ---
    print("ipsum Création du schéma Administratif...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS factures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT,
        montant REAL,
        date_emission DATE,
        statut TEXT, -- Payée, En attente, Annulée
        client TEXT
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT,
        poste TEXT,
        departement TEXT,
        salaire INTEGER,
        date_embauche DATE
    )
    """)

def seed_education(cursor):
    """Génère des données Éducation"""
    noms = ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois"]
    prenoms = ["Lucas", "Léa", "Gabriel", "Chloé", "Léo", "Manon", "Louis", "Emma"]
    classes = ["6ème A", "5ème B", "Terminal S", "Licence 1", "Master 2"]
    
    print("   -> Génération étudiants...")
    for _ in range(50):
        cursor.execute("INSERT INTO etudiants (nom, prenom, classe, moyenne, absences) VALUES (?, ?, ?, ?, ?)",
                      (random.choice(noms), random.choice(prenoms), random.choice(classes), 
                       round(random.uniform(8, 18), 2), random.randint(0, 15)))

    matieres = ["Maths", "Physique", "Histoire", "Français", "Anglais", "Informatique"]
    for m in matieres:
        cursor.execute("INSERT INTO cours (matiere, enseignant, salle, horaire) VALUES (?, ?, ?, ?)",
                      (m, f"Prof. {random.choice(noms)}", f"Salle {random.randint(100, 300)}", "08:00"))

def seed_admin(cursor):
    """Génère des données Administratives"""
    print("   -> Génération données administratives...")
    
    # Employés
    postes = ["Développeur", "Comptable", "RH", "Manager", "Assistant", "Directeur"]
    depts = ["IT", "Finance", "Ressources Humaines", "Direction", "Marketing"]
    
    for _ in range(30):
        cursor.execute("INSERT INTO employes (nom, poste, departement, salaire, date_embauche) VALUES (?, ?, ?, ?, ?)",
                      (f"{random.choice(['Dupont', 'Smith', 'Wong', 'Garcia'])} {random.choice(['Jean', 'Marie', 'Paul'])}",
                       random.choice(postes), random.choice(depts), random.randint(30000, 80000), 
                       (datetime.now() - timedelta(days=random.randint(0, 3000))).strftime("%Y-%m-%d")))

    # Factures
    statuts = ["Payée", "En attente", "En retard"]
    for i in range(100):
        cursor.execute("INSERT INTO factures (reference, montant, date_emission, statut, client) VALUES (?, ?, ?, ?, ?)",
                      (f"FAC-{2025}-{i+1000}", random.randint(100, 5000), 
                       (datetime.now() - timedelta(days=random.randint(0, 365))).strftime("%Y-%m-%d"),
                       random.choice(statuts), f"Client {random.randint(1, 20)}"))

def main():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        init_domain_tables(cursor)
        seed_education(cursor)
        seed_admin(cursor)
        
        conn.commit()
        print("✅ Données multi-domaines injectées avec succès !")
        
        # Vérification
        cursor.execute("SELECT COUNT(*) FROM etudiants")
        print(f"   - Étudiants: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM factures")
        print(f"   - Factures: {cursor.fetchone()[0]}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()

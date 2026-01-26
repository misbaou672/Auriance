# backend/app/services/database_service.py
import sqlite3
from dataclasses import dataclass
from typing import List

@dataclass
class Patient:
    id: int
    nom: str
    age: int
    conditions: List[str]

@dataclass
class Habitude:
    id: int
    type: str
    description: str
    frequence: str

@dataclass
class Planning:
    id: int
    patient_id: int
    activite: str
    date_heure: str
    statut: str

class DatabaseService:
    def __init__(self):
        self.conn = None
        
    async def initialize(self):
        """Initialise la base de données"""
        try:
            self.conn = sqlite3.connect('auriance.db', check_same_thread=False)
            self._create_tables()
            print("✅ Base de données initialisée")
        except Exception as e:
            print(f"❌ Erreur base de données: {e}")
        
    def _create_tables(self):
        """Crée les tables si elles n'existent pas"""
        cursor = self.conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY,
                nom TEXT NOT NULL,
                age INTEGER,
                conditions TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS habitudes (
                id INTEGER PRIMARY KEY,
                type TEXT NOT NULL,
                description TEXT,
                frequence TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS planning (
                id INTEGER PRIMARY KEY,
                patient_id INTEGER,
                activite TEXT,
                date_heure TEXT,
                statut TEXT
            )
        ''')
        
        self._insert_demo_data()
        self.conn.commit()
        
    def _insert_demo_data(self):
        """Insère des données de démonstration"""
        cursor = self.conn.cursor()
        
        patients = [
            (1, 'Jean Dupont', 45, 'hypertension,diabète'),
            (2, 'Marie Martin', 32, 'asthme'),
            (3, 'Pierre Durand', 68, 'arthrose')
        ]
        
        cursor.executemany(
            'INSERT OR IGNORE INTO patients VALUES (?, ?, ?, ?)', patients
        )
        
        habitudes = [
            (1, 'sport', 'Course à pied 30min', 'quotidien'),
            (2, 'nutrition', '5 fruits/légumes par jour', 'quotidien'),
            (3, 'sommeil', 'Coucher 22h-6h', 'quotidien')
        ]
        
        cursor.executemany(
            'INSERT OR IGNORE INTO habitudes VALUES (?, ?, ?, ?)', habitudes
        )
        
        planning = [
            (1, 1, 'Consultation cardiologie', '2024-01-15 10:00', 'confirmé'),
            (2, 2, 'Contrôle asthme', '2024-01-16 14:30', 'planifié'),
            (3, 3, 'Séance kinésithérapie', '2024-01-17 09:00', 'terminé')
        ]
        
        cursor.executemany(
            'INSERT OR IGNORE INTO planning VALUES (?, ?, ?, ?, ?)', planning
        )

# Instance globale
database_service = DatabaseService()
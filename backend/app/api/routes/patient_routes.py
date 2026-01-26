# backend/app/api/routes/patient_routes.py
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/patients", tags=["Patients"])

# Import différé pour éviter les circulaires
_database_service = None

def get_database_service():
    global _database_service
    if _database_service is None:
        from backend.main import database_service
        _database_service = database_service
    return _database_service

@router.get("")
async def get_patients():
    """Liste des patients"""
    database_service = get_database_service()
    
    if database_service is None or database_service.conn is None:
        raise HTTPException(500, "Base de données non initialisée")
        
    cursor = database_service.conn.cursor()
    cursor.execute("SELECT * FROM patients")
    patients = cursor.fetchall()
    
    return {
        "patients": [
            {
                "id": p[0],
                "nom": p[1],
                "age": p[2],
                "conditions": p[3].split(',') if p[3] else []
            }
            for p in patients
        ]
    }

@router.get("/{patient_id}")
async def get_patient(patient_id: int):
    """Détails d'un patient"""
    database_service = get_database_service()
    
    if database_service is None or database_service.conn is None:
        raise HTTPException(500, "Base de données non initialisée")
        
    cursor = database_service.conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    patient = cursor.fetchone()
    
    if not patient:
        raise HTTPException(404, "Patient non trouvé")
    
    return {
        "id": patient[0],
        "nom": patient[1],
        "age": patient[2],
        "conditions": patient[3].split(',') if patient[3] else []
    }
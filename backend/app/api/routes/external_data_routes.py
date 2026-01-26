from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import requests
import uuid
from datetime import datetime

router = APIRouter()

# ===== MODÈLES POUR LES DONNÉES EXTERNES =====
class ExternalHealthData(BaseModel):
    user_id: str
    data_type: str
    value: float
    unit: str
    source: str
    timestamp: str

class MedicalRecord(BaseModel):
    record_id: str
    user_id: str
    record_type: str
    description: str
    date: str
    provider: str
    details: Dict[str, Any]

class InsuranceClaim(BaseModel):
    claim_id: str
    user_id: str
    amount: float
    status: str
    submission_date: str
    processing_date: Optional[str]

class PharmacyOrder(BaseModel):
    order_id: str
    user_id: str
    medication: str
    quantity: int
    pharmacy: str
    status: str

# ===== DONNÉES DE DÉMO =====
demo_external_data = [
    ExternalHealthData(
        user_id="1",
        data_type="steps",
        value=8432,
        unit="steps",
        source="fitbit",
        timestamp="2024-01-15T08:00:00"
    ),
    ExternalHealthData(
        user_id="1", 
        data_type="heart_rate",
        value=72,
        unit="bpm",
        source="apple_watch",
        timestamp="2024-01-15T09:00:00"
    )
]

demo_medical_records = [
    MedicalRecord(
        record_id="1",
        user_id="1",
        record_type="consultation",
        description="Consultation cardiologie",
        date="2024-01-10",
        provider="Hôpital Saint-Louis",
        details={"doctor": "Dr. Martin", "diagnosis": "Hypertension contrôlée"}
    )
]

demo_insurance_claims = [
    InsuranceClaim(
        claim_id="1",
        user_id="1",
        amount=150.0,
        status="processed",
        submission_date="2024-01-12",
        processing_date="2024-01-14"
    )
]

demo_pharmacy_orders = [
    PharmacyOrder(
        order_id="1",
        user_id="1",
        medication="Betaloc 50mg",
        quantity=1,
        pharmacy="Pharmacie Centrale",
        status="delivered"
    )
]

# ===== ROUTES POUR LES DONNÉES DE SANTÉ EXTERNES =====
@router.get("/health-data", tags=["External Health Data"])
def get_external_health_data(user_id: str, data_type: Optional[str] = None):
    """Récupère les données de santé provenant de sources externes"""
    filtered_data = [data for data in demo_external_data if data.user_id == user_id]
    
    if data_type:
        filtered_data = [data for data in filtered_data if data.data_type == data_type]
    
    return {
        "user_id": user_id,
        "data_count": len(filtered_data),
        "health_data": filtered_data
    }

@router.post("/health-data", tags=["External Health Data"])
def sync_external_health_data(data: ExternalHealthData):
    """Synchronise les données de santé depuis une source externe"""
    demo_external_data.append(data)
    return {
        "message": "Données synchronisées avec succès",
        "data_id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat()
    }

@router.get("/health-data/sources", tags=["External Health Data"])
def get_available_data_sources():
    """Liste les sources de données externes disponibles"""
    return {
        "sources": [
            {
                "name": "Fitbit",
                "type": "wearable",
                "data_types": ["steps", "heart_rate", "sleep", "calories"],
                "connected": True
            },
            {
                "name": "Apple Health",
                "type": "mobile",
                "data_types": ["steps", "heart_rate", "blood_pressure", "weight"],
                "connected": True
            },
            {
                "name": "Withings",
                "type": "smart_scale",
                "data_types": ["weight", "body_fat", "muscle_mass"],
                "connected": False
            }
        ]
    }

# ===== ROUTES POUR LES DOSSIERS MÉDICAUX EXTERNES =====
@router.get("/medical-records", tags=["External Medical Records"])
def get_external_medical_records(user_id: str):
    """Récupère les dossiers médicaux provenant d'établissements externes"""
    user_records = [record for record in demo_medical_records if record.user_id == user_id]
    
    return {
        "user_id": user_id,
        "total_records": len(user_records),
        "medical_records": user_records
    }

@router.post("/medical-records/sync", tags=["External Medical Records"])
def sync_medical_records(user_id: str, provider: str):
    """Synchronise les dossiers médicaux avec un établissement de santé"""
    # Simulation de synchronisation
    new_records = [
        MedicalRecord(
            record_id=str(uuid.uuid4()),
            user_id=user_id,
            record_type="lab_results",
            description="Analyse sanguine",
            date=datetime.now().strftime("%Y-%m-%d"),
            provider=provider,
            details={"test": "NFS", "results": "Normaux"}
        )
    ]
    
    demo_medical_records.extend(new_records)
    
    return {
        "message": f"Dossiers synchronisés avec {provider}",
        "records_added": len(new_records),
        "provider": provider
    }

# ===== ROUTES POUR LES ASSURANCES =====
@router.get("/insurance/claims", tags=["External Insurance"])
def get_insurance_claims(user_id: str):
    """Récupère les informations de remboursement d'assurance"""
    user_claims = [claim for claim in demo_insurance_claims if claim.user_id == user_id]
    
    return {
        "user_id": user_id,
        "total_claims": len(user_claims),
        "claims": user_claims
    }

@router.post("/insurance/claims/submit", tags=["External Insurance"])
def submit_insurance_claim(user_id: str, amount: float, description: str):
    """Soumet une nouvelle demande de remboursement"""
    new_claim = InsuranceClaim(
        claim_id=str(uuid.uuid4()),
        user_id=user_id,
        amount=amount,
        status="submitted",
        submission_date=datetime.now().strftime("%Y-%m-%d"),
        processing_date=None
    )
    
    demo_insurance_claims.append(new_claim)
    
    return {
        "message": "Demande de remboursement soumise",
        "claim_id": new_claim.claim_id,
        "estimated_processing": "7-10 jours"
    }

# ===== ROUTES POUR LES PHARMACIES =====
@router.get("/pharmacy/orders", tags=["External Pharmacy"])
def get_pharmacy_orders(user_id: str):
    """Récupère les commandes de pharmacie"""
    user_orders = [order for order in demo_pharmacy_orders if order.user_id == user_id]
    
    return {
        "user_id": user_id,
        "orders": user_orders
    }

@router.post("/pharmacy/orders", tags=["External Pharmacy"])
def create_pharmacy_order(user_id: str, medication: str, quantity: int, pharmacy: str = "Pharmacie Centrale"):
    """Passe une commande en pharmacie"""
    new_order = PharmacyOrder(
        order_id=str(uuid.uuid4()),
        user_id=user_id,
        medication=medication,
        quantity=quantity,
        pharmacy=pharmacy,
        status="pending"
    )
    
    demo_pharmacy_orders.append(new_order)
    
    return {
        "message": "Commande passée avec succès",
        "order_id": new_order.order_id,
        "estimated_delivery": "24-48h"
    }

# ===== INTÉGRATIONS AVEC SERVICES EXTERNES =====
@router.get("/integrations/status", tags=["External Integrations"])
def get_integrations_status():
    """Statut des intégrations avec les services externes"""
    return {
        "integrations": [
            {
                "service": "Fitbit API",
                "status": "connected",
                "last_sync": "2024-01-15T10:30:00",
                "data_types": ["activity", "sleep", "heart_rate"]
            },
            {
                "service": "Apple HealthKit",
                "status": "connected", 
                "last_sync": "2024-01-15T09:15:00",
                "data_types": ["vital_signs", "nutrition", "medications"]
            },
            {
                "service": "Ameli (Carte Vitale)",
                "status": "pending",
                "last_sync": None,
                "data_types": ["insurance_claims", "medical_history"]
            },
            {
                "service": "Google Fit",
                "status": "disconnected",
                "last_sync": "2024-01-10T14:20:00",
                "data_types": ["fitness", "body_metrics"]
            }
        ]
    }

@router.post("/integrations/connect", tags=["External Integrations"])
def connect_external_service(service_name: str, auth_data: Dict[str, str]):
    """Connecte un service externe"""
    # Simulation de connexion
    return {
        "message": f"Service {service_name} connecté avec succès",
        "service": service_name,
        "connected_at": datetime.now().isoformat(),
        "available_data": ["health_metrics", "activity_data", "sleep_data"]
    }

@router.delete("/integrations/disconnect", tags=["External Integrations"])
def disconnect_external_service(service_name: str):
    """Déconnecte un service externe"""
    return {
        "message": f"Service {service_name} déconnecté",
        "service": service_name,
        "disconnected_at": datetime.now().isoformat()
    }

# ===== SYNCHRONISATION GLOBALE =====
@router.post("/sync/all", tags=["External Sync"])
def sync_all_external_data(user_id: str):
    """Synchronise toutes les données externes pour un utilisateur"""
    # Simulation de synchronisation complète
    sync_results = {
        "user_id": user_id,
        "sync_timestamp": datetime.now().isoformat(),
        "results": {
            "fitbit": {"status": "success", "data_points": 15},
            "apple_health": {"status": "success", "data_points": 23},
            "medical_records": {"status": "success", "records_synced": 3},
            "insurance": {"status": "success", "claims_updated": 2}
        },
        "summary": {
            "total_data_synced": 43,
            "duration_seconds": 2.5,
            "new_alerts": 1
        }
    }
    
    return sync_results

# ===== WEBHOOKS POUR DONNÉES EXTERNES =====
@router.post("/webhook/fitbit", tags=["External Webhooks"])
def fitbit_webhook(data: Dict[str, Any]):
    """Webhook pour recevoir les données Fitbit"""
    # Traitement des données Fitbit
    return {
        "status": "received",
        "data_type": data.get("type", "unknown"),
        "processed": True,
        "timestamp": datetime.now().isoformat()
    }

@router.post("/webhook/healthkit", tags=["External Webhooks"])
def healthkit_webhook(data: Dict[str, Any]):
    """Webhook pour recevoir les données Apple HealthKit"""
    return {
        "status": "received", 
        "service": "apple_healthkit",
        "data_points": len(data.get("data", [])),
        "processed": True
    }

# ===== STATISTIQUES DONNÉES EXTERNES =====
@router.get("/stats", tags=["External Data"])
def get_external_data_stats(user_id: str):
    """Statistiques sur les données externes"""
    user_health_data = [d for d in demo_external_data if d.user_id == user_id]
    user_medical_records = [r for r in demo_medical_records if r.user_id == user_id]
    
    return {
        "user_id": user_id,
        "health_data": {
            "total_points": len(user_health_data),
            "sources": list(set([d.source for d in user_health_data])),
            "last_sync": datetime.now().isoformat()
        },
        "medical_records": {
            "total_records": len(user_medical_records),
            "providers": list(set([r.provider for r in user_medical_records]))
        },
        "insurance": {
            "total_claims": len([c for c in demo_insurance_claims if c.user_id == user_id]),
            "total_amount": sum([c.amount for c in demo_insurance_claims if c.user_id == user_id])
        }
    }
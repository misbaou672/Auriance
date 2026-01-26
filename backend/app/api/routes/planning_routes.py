# Fichier: backend/app/api/routes/planning_routes.py

# --- CORRECTION ICI ---
from fastapi import APIRouter, status, Depends, HTTPException 
# --- FIN CORRECTION ---
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from ...services.planning_service import PlanningService, Appointment, OptimizedVisit # Import du nouveau service

# --- SCHÉMAS D'ENTRÉE/SORTIE (Normalement dans models/planning_schemas.py) ---
class AppointmentRequest(BaseModel):
    id: str = Field(..., description="ID unique du patient/rendez-vous.")
    address: str = Field(..., description="Adresse complète du patient.")
    duration_minutes: int = Field(..., gt=0, description="Durée estimée de l'intervention en minutes.")
    priority: str = Field(..., description="Niveau de priorité: Urgent, Standard, Suivi.")
    required_time: Optional[str] = Field(None, description="Créneau horaire strict (ex: '10:00').")

class RouteOptimizationRequest(BaseModel):
    nurse_id: str = Field(..., description="ID de l'infirmier(ère) concerné(e).")
    date: str = Field(..., description="Date de la tournée (YYYY-MM-DD).")
    start_address: str = Field(..., description="Adresse de départ de la tournée (ex: domicile).")
    end_address: str = Field(..., description="Adresse de fin de la tournée.")
    appointments: List[AppointmentRequest]

class OptimizedVisitResponse(BaseModel):
    appointment_id: str
    scheduled_start: datetime
    scheduled_end: datetime
    travel_time_minutes: int
    priority: str

# --- ROUTER ET LOGIQUE D'API ---

router = APIRouter(
    prefix="/planning",
    tags=["Planification & Optimisation"],
)

planning_service = PlanningService()

@router.post(
    "/optimize-route",
    response_model=List[OptimizedVisitResponse],
    status_code=status.HTTP_200_OK,
    summary="Calcule et retourne le planning optimisé de la tournée de l'infirmier(ère)."
)
async def optimize_route(request: RouteOptimizationRequest):
    """
    Reçoit une liste de rendez-vous et calcule l'itinéraire le plus efficace
    en tenant compte des contraintes de trafic, météo et priorité.
    """
    try:
        # Convertir les schémas Pydantic en objets simples pour le service
        app_objects = [
            Appointment(
                id=app.id,
                address=app.address,
                duration_minutes=app.duration_minutes,
                priority=app.priority,
                required_time=app.required_time
            )
            for app in request.appointments
        ]
        
        # Le service renvoie des OptimizedVisit
        optimized_visits = planning_service.optimize_daily_route(
            appointments=app_objects,
            start_address=request.start_address,
            end_address=request.end_address,
            date=datetime.strptime(request.date, "%Y-%m-%d")
        )

        # Convertir les OptimizedVisit en schémas de réponse Pydantic
        response_data = [
            OptimizedVisitResponse(
                appointment_id=visit.appointment_id,
                scheduled_start=visit.scheduled_start,
                scheduled_end=visit.scheduled_end,
                travel_time_minutes=visit.travel_time_minutes,
                priority=visit.priority
            )
            for visit in optimized_visits
        ]
        
        return response_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur d'optimisation de la tournée: {str(e)}"
        )

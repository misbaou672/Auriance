# app/api/routes/agent_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from app.services.agent_service import HealthAgent

router = APIRouter(prefix="/agents", tags=["Agents"])

class ChatMessage(BaseModel):
    user_id: int
    message: str
    context: dict = None

class AgentResponse(BaseModel):
    answer: str
    type: str
    urgency: str
    suggestions: list

@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(chat_data: ChatMessage):
    """
    Dialogue avec l'agent santé intelligent
    """
    try:
        agent = HealthAgent()
        response = await agent.process_user_message(
            user_id=chat_data.user_id,
            message=chat_data.message,
            context=chat_data.context
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du traitement du message: {str(e)}"
        )

@router.get("/conversation/{user_id}")
async def get_conversation_history(user_id: int):
    """
    Récupère l'historique de conversation d'un utilisateur
    """
    try:
        agent = HealthAgent()
        history = agent.get_conversation_history(user_id)
        
        return {
            "user_id": user_id,
            "conversation_history": history,
            "total_messages": len(history)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération de l'historique: {str(e)}"
        )

@router.delete("/conversation/{user_id}")
async def clear_conversation(user_id: int):
    """
    Efface l'historique de conversation d'un utilisateur
    """
    try:
        agent = HealthAgent()
        agent.clear_conversation_history(user_id)
        
        return {
            "status": "success",
            "message": f"Historique de conversation effacé pour l'utilisateur {user_id}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'effacement de l'historique: {str(e)}"
        )

@router.get("/health")
async def agent_health_check():
    return {
        "status": "healthy",
        "service": "Health Agent",
        "capabilities": [
            "mental_health", "sleep", "nutrition", 
            "exercise", "symptoms", "general_health"
        ]
    }
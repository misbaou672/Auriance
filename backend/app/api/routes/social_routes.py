# app/api/routes/social_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime

router = APIRouter(prefix="/social", tags=["Health Social Network"])

class SocialPost(BaseModel):
    user_id: int
    content: str
    category: str
    is_anonymous: bool = True

class SupportGroup(BaseModel):
    name: str
    description: str
    category: str
    privacy: str = "public"

@router.get("/groups")
async def get_support_groups(category: str = None):
    """
    Récupère les groupes de soutien santé
    """
    try:
        groups = await _get_available_groups(category)
        return {
            "groups": groups,
            "total_groups": len(groups),
            "categories": ["stress", "sommeil", "nutrition", "general"]
        }
    except Exception as e:
        raise HTTPException(500, f"Erreur récupération groupes: {str(e)}")

@router.post("/posts")
async def create_social_post(post: SocialPost):
    """
    Crée un post dans le réseau social santé
    """
    try:
        new_post = await _publish_social_post(post)
        return {
            "status": "success",
            "post_id": new_post["id"],
            "message": "Post publié avec succès",
            "anonymous": post.is_anonymous
        }
    except Exception as e:
        raise HTTPException(500, f"Erreur publication post: {str(e)}")

@router.get("/posts/{category}")
async def get_category_posts(category: str):
    """
    Récupère les posts d'une catégorie spécifique
    """
    try:
        posts = await _get_category_posts(category)
        return {
            "category": category,
            "posts": posts,
            "total_posts": len(posts)
        }
    except Exception as e:
        raise HTTPException(500, f"Erreur récupération posts: {str(e)}")

@router.get("/events")
async def get_wellness_events():
    """
    Récupère les événements bien-être à venir
    """
    try:
        events = await _get_upcoming_events()
        return {
            "events": events,
            "total_events": len(events)
        }
    except Exception as e:
        raise HTTPException(500, f"Erreur récupération événements: {str(e)}")

@router.post("/mentoring/request")
async def request_mentoring(user_id: int, expertise: str):
    """
    Demande de parrainage santé
    """
    try:
        match = await _find_mentor_match(user_id, expertise)
        return {
            "status": "success",
            "mentor_found": match["found"],
            "mentor_info": match["mentor"] if match["found"] else None,
            "wait_time": match["wait_time"]
        }
    except Exception as e:
        raise HTTPException(500, f"Erreur recherche mentor: {str(e)}")

async def _get_available_groups(category: str = None) -> List[Dict[str, Any]]:
    """Récupère les groupes de soutien"""
    groups = [
        {
            "id": "stress_management",
            "name": "Gestion du Stress 🙏",
            "description": "Groupe d'entraide pour mieux gérer le stress quotidien",
            "member_count": 245,
            "category": "stress",
            "activity_level": "high"
        },
        {
            "id": "sleep_improvement", 
            "name": "Amélioration du Sommeil 😴",
            "description": "Conseils et soutien pour un sommeil réparateur",
            "member_count": 189,
            "category": "sommeil",
            "activity_level": "medium"
        }
    ]
    
    if category:
        groups = [g for g in groups if g["category"] == category]
    
    return groups

async def _publish_social_post(post: SocialPost) -> Dict[str, Any]:
    """Publie un post social"""
    return {
        "id": f"post_{datetime.now().timestamp()}",
        "content": post.content,
        "category": post.category,
        "timestamp": datetime.now().isoformat(),
        "likes": 0,
        "comments": []
    }

async def _get_category_posts(category: str) -> List[Dict[str, Any]]:
    """Récupère les posts par catégorie"""
    return [
        {
            "id": "post_1",
            "content": "La méditation m'a vraiment aidé à gérer mon stress!",
            "category": category,
            "timestamp": "2024-01-15T10:30:00",
            "likes": 15,
            "comments": 3
        }
    ]

async def _get_upcoming_events() -> List[Dict[str, Any]]:
    """Récupère les événements bien-être"""
    return [
        {
            "id": "event_1",
            "title": "Méditation Collective en Ligne 🧘‍♀️",
            "description": "Session de méditation guidée en groupe",
            "date": "2024-01-20T18:00:00",
            "duration": "45 minutes",
            "participants": 89,
            "category": "mental_health"
        }
    ]

async def _find_mentor_match(user_id: int, expertise: str) -> Dict[str, Any]:
    """Trouve un mentor correspondant"""
    return {
        "found": True,
        "mentor": {
            "username": "***WellnessPro",
            "expertise": expertise,
            "success_rate": 0.95,
            "availability": "weekends"
        },
        "wait_time": "24-48h"
    }
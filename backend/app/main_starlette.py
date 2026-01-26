"""
Serveur minimal Starlette pour AURIANCE
"""
from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import asyncio

# Endpoints simples
async def health_endpoint(request):
    return JSONResponse({"status": "healthy", "version": "1.0.0"})

async def root_endpoint(request):
    return JSONResponse({
        "message": "AURIANCE API - Serveur opérationnel",
        "endpoints": {"health": "/health"}
    })

# Routes
routes = [
    Route("/health", health_endpoint, methods=["GET"]),
    Route("/", root_endpoint, methods=["GET"]),
]

# Application Starlette
app = Starlette(routes=routes, lifespan=None)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

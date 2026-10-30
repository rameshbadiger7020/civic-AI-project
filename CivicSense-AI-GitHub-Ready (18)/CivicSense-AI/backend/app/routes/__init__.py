from app.routes.complaints import router as complaints_router
from app.routes.ai import router as ai_router
from app.routes.dashboard import router as dashboard_router
from app.routes.departments import router as departments_router
from app.routes.auth import router as auth_router

__all__ = [
    "complaints_router",
    "ai_router",
    "dashboard_router",
    "departments_router",
    "auth_router",
]

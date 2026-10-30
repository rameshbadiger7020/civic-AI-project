import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import PROJECT_NAME, VERSION, API_V1_STR, UPLOAD_DIR
from app.database.session import engine, Base, SessionLocal
from app.routes.complaints import router as complaints_router
from app.routes.ai import router as ai_router
from app.routes.dashboard import router as dashboard_router
from app.routes.departments import router as departments_router, seed_default_departments
from app.routes.auth import router as auth_router, ensure_default_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_default_departments(db)
        ensure_default_admin(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description="Enterprise-Grade Civic Intelligence & Autonomous Complaint Resolution Platform",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount media static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API Routers
app.include_router(complaints_router, prefix=API_V1_STR)
app.include_router(ai_router, prefix=API_V1_STR)
app.include_router(dashboard_router, prefix=API_V1_STR)
app.include_router(departments_router, prefix=API_V1_STR)
app.include_router(auth_router, prefix=API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": PROJECT_NAME,
        "version": VERSION,
        "status": "operational",
        "docs_url": "/docs",
        "api_v1": API_V1_STR
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": PROJECT_NAME}

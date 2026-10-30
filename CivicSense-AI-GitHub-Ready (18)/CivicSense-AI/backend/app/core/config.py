import os
from pathlib import Path

# Disable SQLAlchemy C extensions to ensure 100% compatibility across all Windows environments
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "uploads"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'civicsense.db'}")

SECRET_KEY = os.getenv("SECRET_KEY", "civicsense-demo-secret-key-2026-production-ready")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "CivicAdmin2026!")

# Prototype configuration
API_V1_STR = "/api/v1"
PROJECT_NAME = "CivicSense AI"
VERSION = "1.0.0"
DEMO_CITY = "Bengaluru, Karnataka"

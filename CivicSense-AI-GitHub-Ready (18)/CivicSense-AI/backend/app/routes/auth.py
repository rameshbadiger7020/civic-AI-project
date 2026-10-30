import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.admin_user import AdminUser
from app.schemas.auth import LoginRequest, LoginResponse
from app.core.config import ADMIN_USERNAME, ADMIN_PASSWORD

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def ensure_default_admin(db: Session):
    admin = db.query(AdminUser).filter(AdminUser.username == ADMIN_USERNAME).first()
    if not admin:
        new_admin = AdminUser(
            username=ADMIN_USERNAME,
            hashed_password=hash_pw(ADMIN_PASSWORD),
            full_name="Municipal Commissioner Desk",
            role="SuperAdmin"
        )
        db.add(new_admin)
        db.commit()

@router.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    ensure_default_admin(db)
    
    admin = db.query(AdminUser).filter(AdminUser.username == creds.username.strip()).first()
    if not admin or admin.hashed_password != hash_pw(creds.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator credentials"
        )

    # Return demonstration token
    token = f"demo-token-{admin.username}-{admin.id}"
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=admin.id,
        username=admin.username,
        full_name=admin.full_name,
        role=admin.role
    )

@router.get("/me")
def verify_session(token: str, db: Session = Depends(get_db)):
    if not token or not token.startswith("demo-token-"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    ensure_default_admin(db)
    admin = db.query(AdminUser).first()
    return {
        "authenticated": True,
        "username": admin.username if admin else ADMIN_USERNAME,
        "role": admin.role if admin else "SuperAdmin"
    }

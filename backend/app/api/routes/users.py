from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserModeUpdate, UserRead
from app.core.security import hash_password
from app.db.dependencies import get_current_user
from app.models.family import FamilyMember


router = APIRouter(prefix="/users")

@router.post("", response_model=UserRead)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        active_profile_mode="solo",
    )


    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me/mode", response_model=UserRead)
def update_my_mode(
    payload: UserModeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.active_profile_mode not in {"solo", "family"}:
        raise HTTPException(status_code=400, detail="Invalid profile mode")
    
    membership = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).first()

    if payload.active_profile_mode == "family" and membership is None:
        raise HTTPException(
            status_code=400,
            detail="Join or create a family before enabling family mode",
        )

    current_user.active_profile_mode = payload.active_profile_mode
    db.commit()
    db.refresh(current_user)

    return current_user

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.schemas.user_preferences import (
    UserPreferencesRead,
    UserPreferencesUpdate,
)

router = APIRouter(prefix="/users/{user_id}/preferences")


@router.get("", response_model=UserPreferencesRead)
def get_user_preferences(user_id: int, db: Session = Depends(get_db)):
    preferences = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id == user_id)
        .first()
    )

    if preferences is None:
        raise HTTPException(status_code=404, detail="User preferences not found")

    return preferences


@router.put("", response_model=UserPreferencesRead)
def upsert_user_preferences(
    user_id: int,
    payload: UserPreferencesUpdate,
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    preferences = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id == user_id)
        .first()
    )

    if preferences is None:
        preferences = UserPreferences(user_id=user_id)
        db.add(preferences)

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(preferences, field, value)

    db.commit()
    db.refresh(preferences)

    return preferences

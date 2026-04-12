from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.schemas.user_preferences import (
    UserPreferencesRead,
    UserPreferencesUpdate,
)

router = APIRouter(prefix="/users/me/preferences")


@router.get("", response_model=UserPreferencesRead)
def get_user_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    preferences = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id == current_user.id)
        .first()
    )

    if preferences is None:
        raise HTTPException(status_code=404, detail="User preferences not found")

    return preferences


@router.put("", response_model=UserPreferencesRead)
def upsert_my_preferences(
    payload: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    preferences = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id == current_user.id)
        .first()
    )

    if preferences is None:
        preferences = UserPreferences(user_id=current_user.id)
        db.add(preferences)

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(preferences, field, value)

    db.commit()
    db.refresh(preferences)

    return preferences


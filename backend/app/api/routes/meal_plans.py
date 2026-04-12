from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from app.db.dependencies import get_current_user, get_db
from app.models.meal_plan import MealPlan, MealPlanItem
from app.models.user import User
from app.schemas.meal_plan import MealPlanCreate, MealPlanRead

router = APIRouter(prefix="/meal-plans")


@router.post("", response_model=MealPlanRead)
def create_meal_plan(
    payload: MealPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal_plan = MealPlan(
        user_id=current_user.id,
        title=payload.title,
        notes=payload.notes,
    )

    for item_payload in payload.items:
        meal_plan.items.append(
            MealPlanItem(**item_payload.model_dump())
        )

    db.add(meal_plan)
    db.commit()
    db.refresh(meal_plan)

    return meal_plan


@router.get("", response_model=list[MealPlanRead])
def list_meal_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(MealPlan)
        .options(selectinload(MealPlan.items))
        .filter(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.id.desc())
        .all()
    )

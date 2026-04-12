from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException

from app.ai.meal_plan_generator import generate_meal_plan_from_ai
from app.models.user_preferences import UserPreferences
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

@router.post("/generate", response_model=MealPlanRead)
def generate_meal_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    preferences = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id == current_user.id)
        .first()
    )

    if preferences is None:
        raise HTTPException(
            status_code=400,
            detail="Please set user preferences before generating a meal plan",
        )

    preferences_data = {
        "disliked_products": preferences.disliked_products,
        "favorite_products": preferences.favorite_products,
        "excluded_products": preferences.excluded_products,
        "preferred_cuisines": preferences.preferred_cuisines,
        "cooking_difficulty": preferences.cooking_difficulty,
        "meals_per_day": preferences.meals_per_day,
    }

    generated_plan = generate_meal_plan_from_ai(preferences_data)

    meal_plan = MealPlan(
        user_id=current_user.id,
        title=generated_plan["title"],
        notes=generated_plan.get("notes"),
    )

    for item_data in generated_plan["items"]:
        meal_plan.items.append(MealPlanItem(**item_data))

    db.add(meal_plan)
    db.commit()
    db.refresh(meal_plan)

    return meal_plan

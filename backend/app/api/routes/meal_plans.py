from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException

from app.services.effective_preferences import get_effective_preferences_for_user
from app.ai.meal_plan_generator import generate_meal_plan_from_ai
from app.db.dependencies import get_current_user, get_db
from app.models.meal_plan import MealPlan, MealPlanItem
from app.models.family import FamilyMember
from app.models.user import User
from app.schemas.meal_plan import MealPlanCreate, MealPlanRead

router = APIRouter(prefix="/meal-plans")

def get_family_membership(db: Session, user_id: int) -> FamilyMember | None:
    return (
        db.query(FamilyMember)
        .filter(FamilyMember.user_id == user_id)
        .first()
    )

def get_accessible_meal_plan(
    db: Session,
    current_user: User,
    meal_plan_id: int,
) -> MealPlan | None:
    query = (
        db.query(MealPlan)
        .options(selectinload(MealPlan.items))
        .filter(MealPlan.id == meal_plan_id)
    )

    if current_user.active_profile_mode == "family":
        membership = get_family_membership(db, current_user.id)
        if membership is None:
            return None

        return query.filter(MealPlan.family_id == membership.family_id).first()

    return query.filter(MealPlan.user_id == current_user.id).first()

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
    query = db.query(MealPlan).options(selectinload(MealPlan.items))

    if current_user.active_profile_mode == "family":
        membership = (
            db.query(FamilyMember)
            .filter(FamilyMember.user_id == current_user.id)
            .first()
        )

        if membership is None:
            return []

        return (
            query
            .filter(MealPlan.family_id == membership.family_id)
            .order_by(MealPlan.id.desc())
            .all()
        )

    return (
        query
        .filter(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.id.desc())
        .all()
    )

@router.post("/generate", response_model=MealPlanRead)
def generate_meal_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    preferences_data = get_effective_preferences_for_user(db, current_user)

    if preferences_data is None:
        raise HTTPException(
            status_code=400,
            detail="Please set user preferences before generating a meal plan",
        )


    generated_plan = generate_meal_plan_from_ai(preferences_data)

    if current_user.active_profile_mode == "solo":
        meal_plan = MealPlan(
            user_id=current_user.id,
            family_id=None,
            title=generated_plan["title"],
            notes=generated_plan.get("notes"),
        )
    else:
        membership = (
            db.query(FamilyMember)
            .filter(FamilyMember.user_id == current_user.id)
            .first()
        )

        meal_plan = MealPlan(
            user_id=current_user.id,
            family_id=membership.family_id,
            title=generated_plan["title"],
            notes=generated_plan.get("notes"),
        )

    for item_data in generated_plan["items"]:
        meal_plan.items.append(MealPlanItem(**item_data))

    db.add(meal_plan)
    db.commit()
    db.refresh(meal_plan)

    return meal_plan

@router.get("/{meal_plan_id}", response_model=MealPlanRead)
def get_meal_plan(
    meal_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal_plan = get_accessible_meal_plan(db, current_user, meal_plan_id)

    if meal_plan is None:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    return meal_plan



@router.get("/{meal_plan_id}/shopping-list")
def get_meal_plan_shopping_list(
    meal_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal_plan = get_accessible_meal_plan(db, current_user, meal_plan_id)

    if meal_plan is None:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    grouped_items = {}

    for meal_item in meal_plan.items:
        for ingredient in meal_item.ingredients:
            name = ingredient.get("name")
            unit = ingredient.get("unit")
            amount = ingredient.get("amount")

            if not name:
                continue

            key = (name.lower(), unit)

            if key not in grouped_items:
                grouped_items[key] = {
                    "name": name,
                    "amount": 0,
                    "unit": unit,
                    "source_meals": [],
                }

            if isinstance(amount, int | float):
                grouped_items[key]["amount"] += amount
            else:
                grouped_items[key]["amount"] = amount

            grouped_items[key]["source_meals"].append(meal_item.recipe_name)

    return {
        "meal_plan_id": meal_plan.id,
        "items": list(grouped_items.values()),
    }

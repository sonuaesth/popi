from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_current_user, get_db
from app.models.meal_plan import MealPlan, MealPlanItem
from app.models.recipe_rating import RecipeRating
from app.models.user import User
from app.schemas.recipe_rating import RecipeRatingCreate, RecipeRatingRead

router = APIRouter(prefix="/meal-plan-items")


@router.post("/{item_id}/rating", response_model=RecipeRatingRead)
def rate_meal_plan_item(
    item_id: int,
    payload: RecipeRatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal_item = (
        db.query(MealPlanItem)
        .join(MealPlan)
        .filter(
            MealPlanItem.id == item_id,
            MealPlan.user_id == current_user.id,
        )
        .first()
    )

    if meal_item is None:
        raise HTTPException(status_code=404, detail="Meal plan item not found")

    rating = (
        db.query(RecipeRating)
        .filter(
            RecipeRating.user_id == current_user.id,
            RecipeRating.meal_plan_item_id == item_id,
        )
        .first()
    )

    if rating is None:
        rating = RecipeRating(
            user_id=current_user.id,
            meal_plan_item_id=item_id,
        )
        db.add(rating)

    rating.rating = payload.rating
    rating.comment = payload.comment

    db.commit()
    db.refresh(rating)

    return rating

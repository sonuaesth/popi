from pydantic import BaseModel, Field


class RecipeRatingCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class RecipeRatingRead(BaseModel):
    id: int
    user_id: int
    meal_plan_item_id: int
    rating: int
    comment: str | None = None

    model_config = {
        "from_attributes": True,
    }

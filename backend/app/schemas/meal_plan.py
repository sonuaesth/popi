from pydantic import BaseModel, Field


class MealPlanItemBase(BaseModel):
    meal_type: str
    recipe_name: str
    ingredients: list[dict] = Field(default_factory=list)
    instructions: list[str] = Field(default_factory=list)
    difficulty: str = "easy"
    estimated_minutes: int | None = None


class MealPlanItemCreate(MealPlanItemBase):
    pass


class MealPlanItemRead(MealPlanItemBase):
    id: int

    model_config = {
        "from_attributes": True,
    }


class MealPlanCreate(BaseModel):
    title: str = "Meal plan"
    notes: str | None = None
    items: list[MealPlanItemCreate]


class MealPlanRead(BaseModel):
    id: int
    user_id: int
    title: str
    notes: str | None = None
    items: list[MealPlanItemRead] = Field(default_factory=list)

    model_config = {
        "from_attributes": True,
    }

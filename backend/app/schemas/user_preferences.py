from pydantic import BaseModel, Field


class UserPreferencesBase(BaseModel):
    disliked_products: list[str] = Field(default_factory=list)
    favorite_products: list[str] = Field(default_factory=list)
    excluded_products: list[str] = Field(default_factory=list)
    preferred_cuisines: list[str] = Field(default_factory=list)
    cooking_difficulty: str = "easy"
    meals_per_day: int = 3


class UserPreferencesCreate(UserPreferencesBase):
    pass


class UserPreferencesUpdate(BaseModel):
    disliked_products: list[str] | None = None
    favorite_products: list[str] | None = None
    excluded_products: list[str] | None = None
    preferred_cuisines: list[str] | None = None
    cooking_difficulty: str | None = None
    meals_per_day: int | None = None


class UserPreferencesRead(UserPreferencesBase):
    id: int
    user_id: int

    model_config = {
        "from_attributes": True,
    }

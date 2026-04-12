from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RecipeRating(Base):
    __tablename__ = "recipe_ratings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    meal_plan_item_id: Mapped[int] = mapped_column(
        ForeignKey("meal_plan_items.id", ondelete="CASCADE"),
        index=True,
    )
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="recipe_ratings")
    meal_plan_item = relationship("MealPlanItem", back_populates="ratings")

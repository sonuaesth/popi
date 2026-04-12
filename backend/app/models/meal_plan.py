from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), default="Meal plan")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="meal_plans")
    items = relationship(
        "MealPlanItem",
        back_populates="meal_plan",
        cascade="all, delete-orphan",
    )


class MealPlanItem(Base):
    __tablename__ = "meal_plan_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    meal_plan_id: Mapped[int] = mapped_column(
        ForeignKey("meal_plans.id", ondelete="CASCADE"),
        index=True,
    )
    meal_type: Mapped[str] = mapped_column(String(50))
    recipe_name: Mapped[str] = mapped_column(String(255))
    ingredients: Mapped[list[dict]] = mapped_column(JSONB, default=list)
    instructions: Mapped[list[str]] = mapped_column(JSONB, default=list)
    difficulty: Mapped[str] = mapped_column(String(50), default="easy")
    estimated_minutes: Mapped[int | None] = mapped_column(nullable=True)

    meal_plan = relationship("MealPlan", back_populates="items")

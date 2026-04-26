from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    active_profile_mode: Mapped[str] = mapped_column(String(20), default="solo")
    
    preferences = relationship(
        "UserPreferences",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    meal_plans = relationship(
        "MealPlan",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    recipe_ratings = relationship(
        "RecipeRating",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    family_membership = relationship(
        "FamilyMember",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )




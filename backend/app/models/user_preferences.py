from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    disliked_products: Mapped[list[str]] = mapped_column(JSONB, default=list)
    favorite_products: Mapped[list[str]] = mapped_column(JSONB, default=list)
    excluded_products: Mapped[list[str]] = mapped_column(JSONB, default=list)
    preferred_cuisines: Mapped[list[str]] = mapped_column(JSONB, default=list)
    allergies: Mapped[list[str]] = mapped_column(JSONB, default=list)

    weight_kg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    activity_level: Mapped[str] = mapped_column(String(50), default="moderate")
    diet_type: Mapped[str] = mapped_column(String(50), default="balanced")
    goal: Mapped[str] = mapped_column(String(100), default="balanced nutrition")
    cooking_difficulty: Mapped[str] = mapped_column(String(50), default="easy")
    meals_per_day: Mapped[int] = mapped_column(Integer, default=3)

    user = relationship("User", back_populates="preferences")

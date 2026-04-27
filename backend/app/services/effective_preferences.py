from sqlalchemy.orm import Session

from app.models.family import FamilyMember
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.services.family_preferences import aggregate_family_preferences


def get_user_preferences_dict(db: Session, user_id: int) -> dict | None:
    prefs = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id == user_id)
        .first()
    )
    if not prefs:
        return None

    return {
        "excluded_products": prefs.excluded_products,
        "allergies": prefs.allergies,
        "disliked_products": prefs.disliked_products,
        "favorite_products": prefs.favorite_products,
        "preferred_cuisines": prefs.preferred_cuisines,
        "meals_per_day": prefs.meals_per_day,
        "cooking_difficulty": prefs.cooking_difficulty,
        "activity_level": prefs.activity_level,
        "diet_type": prefs.diet_type,
        "goal": prefs.goal,
        "weight_kg": prefs.weight_kg,
        "servings": 1,
        "planning_mode": "solo",
    }


def get_effective_preferences_for_user(db: Session, user: User) -> dict | None:
    if user.active_profile_mode == "solo":
        return get_user_preferences_dict(db, user.id)

    membership = (
        db.query(FamilyMember)
        .filter(FamilyMember.user_id == user.id)
        .first()
    )

    if not membership:
        return get_user_preferences_dict(db, user.id)

    family_member_user_ids = (
        db.query(FamilyMember.user_id)
        .filter(FamilyMember.family_id == membership.family_id)
        .all()
    )
    user_ids = [row[0] for row in family_member_user_ids]

    family_preferences = (
        db.query(UserPreferences)
        .filter(UserPreferences.user_id.in_(user_ids))
        .all()
    )

    aggregated_preferences = aggregate_family_preferences(family_preferences)
    aggregated_preferences["servings"] = max(len(user_ids), 1)
    aggregated_preferences["planning_mode"] = "family"

    return aggregated_preferences

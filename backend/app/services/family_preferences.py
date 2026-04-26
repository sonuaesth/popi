from app.models.user_preferences import UserPreferences


DIFFICULTY_ORDER = {
    "easy": 1,
    "medium": 2,
    "hard": 3,
}


def unique_lower_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for item in items:
        normalized = item.strip()
        if not normalized:
            continue

        key = normalized.lower()
        if key in seen:
            continue

        seen.add(key)
        result.append(normalized)

    return result


def aggregate_family_preferences(preferences_list: list[UserPreferences]) -> dict:
    if not preferences_list:
        return {
            "excluded_products": [],
            "allergies": [],
            "disliked_products": [],
            "favorite_products": [],
            "preferred_cuisines": [],
            "meals_per_day": 3,
            "cooking_difficulty": "easy",
            "activity_level": "moderate",
            "diet_type": "balanced",
            "goal": "balanced nutrition",
            "weight_kg": None,
        }

    excluded_products: list[str] = []
    allergies: list[str] = []
    disliked_products: list[str] = []
    favorite_products: list[str] = []
    preferred_cuisines: list[str] = []

    meals_per_day_values: list[int] = []
    difficulties: list[str] = []
    diet_types: list[str] = []

    for prefs in preferences_list:
        excluded_products.extend(prefs.excluded_products or [])
        allergies.extend(prefs.allergies or [])
        disliked_products.extend(prefs.disliked_products or [])
        favorite_products.extend(prefs.favorite_products or [])
        preferred_cuisines.extend(prefs.preferred_cuisines or [])

        meals_per_day_values.append(prefs.meals_per_day or 3)
        difficulties.append(prefs.cooking_difficulty or "easy")
        diet_types.append(prefs.diet_type or "balanced")

    unique_diet_types = {diet.lower() for diet in diet_types if diet}

    return {
        "excluded_products": unique_lower_preserve_order(excluded_products + allergies),
        "allergies": unique_lower_preserve_order(allergies),
        "disliked_products": unique_lower_preserve_order(disliked_products),
        "favorite_products": unique_lower_preserve_order(favorite_products),
        "preferred_cuisines": unique_lower_preserve_order(preferred_cuisines),
        "meals_per_day": max(meals_per_day_values) if meals_per_day_values else 3,
        "cooking_difficulty": min(
            difficulties,
            key=lambda value: DIFFICULTY_ORDER.get(value, 1),
        ),
        "activity_level": "moderate",
        "diet_type": diet_types[0] if len(unique_diet_types) == 1 else "balanced",
        "goal": "balanced nutrition",
        "weight_kg": None,
    }

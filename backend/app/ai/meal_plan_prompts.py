def build_meal_plan_prompt(preferences: dict) -> str:
    return f"""
Create a simple daily meal plan based on these user preferences:

{preferences}

Rules:
- Respect excluded_products strictly.
- Prefer favorite_products when possible.
- Avoid disliked_products when possible.
- Match preferred_cuisines when possible.
- Keep cooking difficulty close to cooking_difficulty.
- Return exactly 3 meals unless meals_per_day says otherwise.
- Return concise cooking instructions.
"""

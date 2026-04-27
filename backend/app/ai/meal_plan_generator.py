import json

from openai import OpenAI

from app.core.config import settings


client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_meal_plan_from_ai(preferences: dict) -> dict:
    servings = preferences.get("servings", 1)
    planning_mode = preferences.get("planning_mode", "solo")

    prompt = f"""
Create a daily meal plan based on these user preferences:

{json.dumps(preferences, ensure_ascii=False)}

This plan is for {servings} person(s) total.
Planning mode: {planning_mode}.

Return only valid JSON with this exact structure:
{{
  "title": "string",
  "notes": "string",
  "items": [
    {{
      "meal_type": "breakfast",
      "recipe_name": "string",
      "ingredients": [
        {{
          "name": "string",
          "amount": 1,
          "unit": "string"
        }}
      ],
      "instructions": ["string"],
      "difficulty": "easy",
      "estimated_minutes": 10
    }}
  ]
}}

Rules:
- Respect excluded_products strictly.
- Treat allergies as strict exclusions.
- Prefer favorite_products when possible.
- Avoid disliked_products when possible.
- Match preferred_cuisines when possible.
- Keep cooking difficulty close to cooking_difficulty.
- Return the number of meals from meals_per_day.
- Every meal must be portioned for exactly {servings} person(s), not per person.
- Ingredient amounts must already be scaled for the full household size of {servings}.
- The shopping list will be built from these ingredient amounts, so never return single-person quantities when servings is greater than 1.
"""

    response = client.responses.create(
        model="gpt-4o-mini",
        input=prompt,
    )

    content = response.output_text.strip()

    print("PREFERENCES SENT TO AI:")
    print(json.dumps(preferences, ensure_ascii=False, indent=2))
    print("RAW AI RESPONSE:")
    print(content)

    if content.startswith("```json"):
        content = content.removeprefix("```json").strip()

    if content.startswith("```"):
        content = content.removeprefix("```").strip()

    if content.endswith("```"):
        content = content.removesuffix("```").strip()

    return json.loads(content)

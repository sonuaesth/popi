import json

from openai import OpenAI

from app.core.config import settings


client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_meal_plan_from_ai(preferences: dict) -> dict:
    prompt = f"""
Create a daily meal plan based on these user preferences:

{json.dumps(preferences, ensure_ascii=False)}

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
- Prefer favorite_products when possible.
- Avoid disliked_products when possible.
- Match preferred_cuisines when possible.
- Keep cooking difficulty close to cooking_difficulty.
- Return the number of meals from meals_per_day.
"""

    response = client.responses.create(
        model="gpt-4o-mini",
        input=prompt,
    )

    content = response.output_text

    print("RAW AI RESPONSE:")
    print(content)

    return json.loads(content)

export type User = {
  id: number;
  email: string;
  name: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type UserPreferences = {
  id: number;
  user_id: number;
  disliked_products: string[];
  favorite_products: string[];
  excluded_products: string[];
  preferred_cuisines: string[];
  allergies: string[];
  weight_kg: number | null;
  activity_level: string;
  diet_type: string;
  goal: string;
  cooking_difficulty: string;
  meals_per_day: number;
};

export type UserPreferencesPayload = {
  disliked_products?: string[];
  favorite_products?: string[];
  excluded_products?: string[];
  preferred_cuisines?: string[];
  allergies?: string[];
  weight_kg?: number | null;
  activity_level?: string;
  diet_type?: string;
  goal?: string;
  cooking_difficulty?: string;
  meals_per_day?: number;
};

export type MealPlanIngredient = {
  name: string;
  amount: number | string;
  unit: string;
};

export type MealPlanItem = {
  id: number;
  meal_type: string;
  recipe_name: string;
  ingredients: MealPlanIngredient[];
  instructions: string[];
  difficulty: string;
  estimated_minutes: number | null;
};

export type MealPlan = {
  id: number;
  user_id: number;
  title: string;
  notes: string | null;
  items: MealPlanItem[];
};

export type ShoppingListItem = {
  name: string;
  amount: number | string;
  unit: string;
  source_meals: string[];
};

export type ShoppingList = {
  meal_plan_id: number;
  items: ShoppingListItem[];
};

export type RecipeRatingPayload = {
  rating: number;
  comment?: string | null;
};

export type RecipeRating = {
  id: number;
  user_id: number;
  meal_plan_item_id: number;
  rating: number;
  comment: string | null;
};

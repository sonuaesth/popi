import { apiRequest } from "./client";
import type { MealPlan, ShoppingList } from "../types/api";

export async function getMealPlans(): Promise<MealPlan[]> {
  return apiRequest<MealPlan[]>("/meal-plans");
}

export async function getMealPlan(mealPlanId: number): Promise<MealPlan> {
  return apiRequest<MealPlan>(`/meal-plans/${mealPlanId}`);
}

export async function generateMealPlan(): Promise<MealPlan> {
  return apiRequest<MealPlan>("/meal-plans/generate", {
    method: "POST",
  });
}

export async function getShoppingList(
  mealPlanId: number,
): Promise<ShoppingList> {
  return apiRequest<ShoppingList>(`/meal-plans/${mealPlanId}/shopping-list`);
}

import { apiRequest } from "./client";
import type { RecipeRating, RecipeRatingPayload } from "../types/api";

export async function getMyRatings(): Promise<RecipeRating[]> {
  return apiRequest<RecipeRating[]>("/meal-plan-items/ratings/me");
}

export async function rateMealPlanItem(
  itemId: number,
  payload: RecipeRatingPayload,
): Promise<RecipeRating> {
  return apiRequest<RecipeRating>(`/meal-plan-items/${itemId}/rating`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

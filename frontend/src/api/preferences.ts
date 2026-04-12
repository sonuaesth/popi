import { apiRequest } from "./client";
import type {
  UserPreferences,
  UserPreferencesPayload,
} from "../types/api";

export async function getPreferences(): Promise<UserPreferences> {
  return apiRequest<UserPreferences>("/users/me/preferences");
}

export async function updatePreferences(
  payload: UserPreferencesPayload,
): Promise<UserPreferences> {
  return apiRequest<UserPreferences>("/users/me/preferences", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

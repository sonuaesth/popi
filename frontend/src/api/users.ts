import { apiRequest } from "./client";
import type { User } from "../types/api";

export async function updateMyMode(
  activeProfileMode: "solo" | "family",
): Promise<User> {
  return apiRequest<User>("/users/me/mode", {
    method: "PATCH",
    body: JSON.stringify({
      active_profile_mode: activeProfileMode,
    }),
  });
}

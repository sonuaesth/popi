import { apiRequest, setToken } from "./client";
import type {
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  User,
} from "../types/api";

const API_URL = import.meta.env.VITE_API_URL;

export async function registerUser(payload: RegisterPayload): Promise<User> {
  return apiRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  const formData = new URLSearchParams();

  formData.append("username", payload.email);
  formData.append("password", payload.password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  const data = (await response.json()) as TokenResponse;
  setToken(data.access_token);

  return data;
}

export async function getMe(): Promise<User> {
  return apiRequest<User>("/users/me");
}

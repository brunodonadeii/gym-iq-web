import { clearAuthStorage } from "@/utils/auth";
import { parseApiResponse } from "@/utils/apiError";

const API_URL = import.meta.env.VITE_API_URL;

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  type: string;
  role?: string;
};

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const jsonData = await parseApiResponse<AuthResponse>(
    response,
    "Nao foi possivel entrar. Confira seu e-mail e senha e tente novamente.",
  );

  clearAuthStorage();
  localStorage.setItem("token", jsonData.token);

  if (jsonData.role) {
    localStorage.setItem("role", jsonData.role);
  }

  return jsonData;
}

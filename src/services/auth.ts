import { clearAuthStorage } from "@/utils/auth";

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
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Credenciais inválidas");

  const jsonData = await res.json();
  clearAuthStorage();
  localStorage.setItem("token", jsonData.token);

  if (jsonData.role) {
    localStorage.setItem("role", jsonData.role);
  }

  return jsonData;
}

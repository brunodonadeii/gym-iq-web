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

export type ForgotPasswordRequest = {
  email: string;
};

export type AuthMessageResponse = {
  message: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
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

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<AuthMessageResponse> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseApiResponse<AuthMessageResponse>(
    response,
    "Nao foi possivel solicitar a redefinicao de senha.",
  );
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<AuthMessageResponse> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseApiResponse<AuthMessageResponse>(
    response,
    "Nao foi possivel redefinir a senha.",
  );
}

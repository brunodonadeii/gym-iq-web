import { clearAuthStorage } from "@/utils/auth";
import { parseApiResponse } from "@/utils/apiError";
import { buildApiUrl } from "@/services/apiUrl";

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  type: string;
  userId: string;
  name: string;
  email: string;
  role?: string;
  lgpdAccepted?: boolean;
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
  const response = await fetch(buildApiUrl("auth/login"), {
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
  const response = await fetch(buildApiUrl("auth/forgot-password"), {
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
  const response = await fetch(buildApiUrl("auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseApiResponse<AuthMessageResponse>(
    response,
    "Nao foi possivel redefinir a senha.",
  );
}


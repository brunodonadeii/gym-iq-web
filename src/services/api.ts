import { auth, clearAuthStorage } from "@/utils/auth";
import { normalizeApiError } from "@/utils/apiError";

const API_URL = import.meta.env.VITE_API_URL;

const redirectToLogin = () => {
  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (window.location.pathname === "/login") return;

  window.location.assign(
    `/login?redirect=${encodeURIComponent(currentPath || "/dashboard")}`,
  );
};

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = auth.token;

  if (!token) {
    clearAuthStorage();
    redirectToLogin();
    throw normalizeApiError(
      {
        erro: "Sessao expirada",
        mensagem: "Sessao expirada. Faca login novamente.",
        status: 401,
      },
      "Sessao expirada. Faca login novamente.",
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  headers.set(
    "Authorization",
    token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  );

  const response = await fetch(`${API_URL}/${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthStorage();
    redirectToLogin();
  }

  return response;
}

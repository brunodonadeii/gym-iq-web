import { auth, clearAuthStorage } from "@/utils/auth";
import { normalizeApiError } from "@/utils/apiError";
import { buildApiUrl } from "@/services/apiUrl";

type LoginRedirectReason = "session-expired" | "permissions-changed";

let redirectingToLogin = false;

export const buildLoginRedirectUrl = (
  reason: LoginRedirectReason,
  currentPath: string,
) => {
  const params = new URLSearchParams({
    redirect:
      reason === "permissions-changed"
        ? "/dashboard"
        : currentPath || "/dashboard",
    reason,
  });

  return `/login?${params.toString()}`;
};

const redirectToLogin = (reason: LoginRedirectReason) => {
  if (redirectingToLogin) return;

  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (window.location.pathname === "/login") return;

  redirectingToLogin = true;
  window.location.assign(buildLoginRedirectUrl(reason, currentPath));
};

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = auth.token;

  if (!token) {
    clearAuthStorage();
    redirectToLogin("session-expired");
    throw normalizeApiError(
      {
        error: "Sessão expirada",
        message: "Sessão expirada. Faça login novamente.",
        status: 401,
      },
      "Sessão expirada. Faça login novamente.",
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  headers.set(
    "Authorization",
    token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  );

  const response = await fetch(buildApiUrl(url), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthStorage();
    redirectToLogin("session-expired");
  }

  if (response.status === 403) {
    clearAuthStorage();
    redirectToLogin("permissions-changed");
  }

  return response;
}



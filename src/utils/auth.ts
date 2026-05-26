export type UserRole = "ADMIN" | "RECEPTION" | "INSTRUCTOR" | "STUDENT";

type JwtPayload = {
  exp?: number;
  role?: string;
  roles?: string[] | string;
  authority?: string;
  authorities?: string[] | string;
};

const normalizeRole = (value?: string | null): UserRole | null => {
  const normalized = value?.replace(/^ROLE_/, "").toUpperCase();

  if (
    normalized === "ADMIN" ||
    normalized === "RECEPTION" ||
    normalized === "INSTRUCTOR" ||
    normalized === "STUDENT"
  ) {
    return normalized;
  }

  return null;
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, payload] = token.split(".");

    if (!payload) return null;

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
};

const resolveRoleFromPayload = (payload: JwtPayload | null): UserRole | null => {
  if (!payload) return null;

  const candidates = [
    payload.role,
    payload.authority,
    ...(Array.isArray(payload.roles) ? payload.roles : [payload.roles]),
    ...(Array.isArray(payload.authorities)
      ? payload.authorities
      : [payload.authorities]),
  ];

  return candidates.reduce<UserRole | null>(
    (role, candidate) => role ?? normalizeRole(candidate),
    null,
  );
};

const isExpiredPayload = (payload: JwtPayload | null) => {
  if (!payload?.exp) return false;

  return payload.exp * 1000 <= Date.now();
};

export const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

const getStoredValidToken = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  const payload = decodeJwtPayload(token);

  if (!payload || isExpiredPayload(payload)) {
    clearAuthStorage();
    return null;
  }

  return token;
};

export const auth = {
  get token() {
    return getStoredValidToken();
  },

  get isAuthenticated() {
    return !!this.token;
  },

  get role() {
    const token = this.token;

    if (!token) return null;

    const storedRole = normalizeRole(localStorage.getItem("role"));

    if (storedRole) return storedRole;

    return resolveRoleFromPayload(decodeJwtPayload(token));
  },

  hasAnyRole(roles: UserRole[]) {
    const currentRole = this.role;

    return currentRole ? roles.includes(currentRole) : false;
  },
};

export const getDefaultPathByRole = (role: UserRole | null) => {
  if (role === "STUDENT") return "/student";
  if (role === "ADMIN" || role === "RECEPTION") return "/dashboard";

  return "/unauthorized";
};

export type UserRole = "ADMIN" | "RECEPTION" | "INSTRUCTOR" | "STUDENT";

type JwtPayload = {
  email?: string;
  exp?: number;
  id?: string;
  role?: string;
  roles?: RoleClaim[] | RoleClaim;
  sub?: string;
  authority?: string;
  authorities?: RoleClaim[] | RoleClaim;
  userId?: string;
};

type RoleClaim =
  | string
  | {
      authority?: string;
      name?: string;
      role?: string;
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

const normalizeRoleClaim = (claim?: RoleClaim | null): UserRole | null => {
  if (!claim) return null;

  if (typeof claim === "string") return normalizeRole(claim);

  return normalizeRole(claim.role ?? claim.authority ?? claim.name);
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
    (role, candidate) => role ?? normalizeRoleClaim(candidate),
    null,
  );
};

const isExpiredPayload = (payload: JwtPayload | null) => {
  if (!payload?.exp) return false;

  return payload.exp * 1000 <= Date.now();
};

const resolveEmailFromPayload = (payload: JwtPayload | null) => {
  if (!payload) return null;

  const candidate = payload.email ?? payload.sub;

  return candidate?.includes("@") ? candidate : null;
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

    return resolveRoleFromPayload(decodeJwtPayload(token));
  },

  get userId() {
    const token = this.token;

    if (!token) return null;

    const payload = decodeJwtPayload(token);
    const resolvedUserId = payload?.userId ?? payload?.id;

    return resolvedUserId ? String(resolvedUserId) : null;
  },

  get email() {
    const token = this.token;

    if (!token) return null;

    return resolveEmailFromPayload(decodeJwtPayload(token));
  },

  hasAnyRole(roles: UserRole[]) {
    const currentRole = this.role;

    return currentRole ? roles.includes(currentRole) : false;
  },
};

export const getDefaultPathByRole = (role: UserRole | null) => {
  if (role === "STUDENT") return "/student";
  if (role === "ADMIN") return "/dashboard";
  if (role === "RECEPTION") return "/students";
  if (role === "INSTRUCTOR") return "/exercises";

  return "/unauthorized";
};


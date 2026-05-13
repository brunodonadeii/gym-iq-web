const API_URL = import.meta.env.VITE_API_URL;

export function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set(
      "Authorization",
      token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    );
  }

  return fetch(`${API_URL}/${url}`, {
    ...options,
    headers,
  });
}

const DEFAULT_API_URL = "https://api.gymiq.gusoaresfdev.com.br";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/+$/, "");

const NORMALIZED_API_BASE_URL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

export function buildApiUrl(path: string) {
  const normalizedPath = path.replace(/^\/+/, "");

  return `${NORMALIZED_API_BASE_URL}/${normalizedPath}`;
}


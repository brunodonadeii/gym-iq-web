import type { PageRequest } from "@/types/pagination";

export const DEFAULT_PAGE_SIZE = 10;

export function buildPaginationParams(
  pagination: PageRequest,
  extraParams?: Record<string, string | number | boolean | undefined>,
) {
  const params = new URLSearchParams();

  params.set("page", String(pagination.page ?? 0));
  params.set("size", String(pagination.size ?? DEFAULT_PAGE_SIZE));

  if (pagination.sort) {
    params.set("sort", pagination.sort);
  }

  Object.entries(extraParams ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

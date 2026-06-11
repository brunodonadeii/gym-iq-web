import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type PlansQueryMode = "active" | "inactive" | "all";
type PlansStatusQuery = "ACTIVE" | "INACTIVE" | "ALL";

const DEFAULT_PLANS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "name,asc",
};

const planStatusQueryMap: Record<PlansQueryMode, PlansStatusQuery> = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  all: "ALL",
};

async function fetchPlans(
  mode: PlansQueryMode,
  search: string,
  pagination: PageRequest,
): Promise<PageResponse<Plan>> {
  const query = buildPaginationParams(pagination, {
    status: planStatusQueryMap[mode],
    ...(search.trim() ? { q: search.trim() } : {}),
  });
  const response = await authFetch(`plans?${query}`);

  return parseApiResponse(response, "Erro ao buscar planos");
}

export function useGetPlans(
  mode: PlansQueryMode = "active",
  search = "",
  pagination: PageRequest = DEFAULT_PLANS_PAGE,
  enabled = true,
) {
  return useQuery({
    queryKey: ["plans", mode, search, pagination],
    queryFn: () => fetchPlans(mode, search, pagination),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type PlansQueryMode = "active" | "all";

const DEFAULT_PLANS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "name,asc",
};

async function fetchPlans(
  mode: PlansQueryMode,
  pagination: PageRequest,
): Promise<PageResponse<Plan>> {
  const query = buildPaginationParams(pagination);
  const response = await authFetch(
    `${mode === "active" ? "plans" : "plans/all"}?${query}`,
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar planos");
  }

  return response.json();
}

export function useGetPlans(
  mode: PlansQueryMode = "active",
  pagination: PageRequest = DEFAULT_PLANS_PAGE,
) {
  return useQuery({
    queryKey: ["plans", mode, pagination],
    queryFn: () => fetchPlans(mode, pagination),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type PlansQueryMode = "active" | "inactive" | "all";
type PlansApiMode = "active" | "all";

const DEFAULT_PLANS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "name,asc",
};

async function fetchPlans(
  mode: PlansApiMode,
  pagination: PageRequest,
): Promise<PageResponse<Plan>> {
  const query = buildPaginationParams(pagination);
  const response = await authFetch(
    `${mode === "active" ? "plans" : "plans/all"}?${query}`,
  );

  return parseApiResponse(response, "Erro ao buscar planos");
}

const paginatePlans = (
  content: Plan[],
  pagination: PageRequest,
): PageResponse<Plan> => {
  const size = pagination.size ?? DEFAULT_PLANS_PAGE.size ?? 10;
  const page = pagination.page ?? 0;
  const start = page * size;
  const pageContent = content.slice(start, start + size);
  const totalPages = Math.ceil(content.length / size);

  return {
    content: pageContent,
    totalElements: content.length,
    totalPages,
    size,
    number: page,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
  };
};

async function fetchInactivePlans(
  pagination: PageRequest,
): Promise<PageResponse<Plan>> {
  const pageSize = 100;
  const plans: Plan[] = [];
  let currentPage = 0;
  let last = false;

  while (!last) {
    const response = await fetchPlans("all", {
      ...pagination,
      page: currentPage,
      size: pageSize,
    });

    plans.push(...response.content);
    last = response.last;
    currentPage += 1;
  }

  return paginatePlans(
    plans.filter((plan) => !plan.active),
    pagination,
  );
}

const matchesSearch = (plan: Plan, search: string) => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return [plan.name, plan.description]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedSearch));
};

async function fetchAllPlansForSearch(mode: PlansQueryMode): Promise<Plan[]> {
  const pageSize = 100;
  const plans: Plan[] = [];
  let currentPage = 0;
  let last = false;

  while (!last) {
    const response = await fetchPlans(mode === "active" ? "active" : "all", {
      page: currentPage,
      size: pageSize,
      sort: "name,asc",
    });

    plans.push(...response.content);
    last = response.last;
    currentPage += 1;
  }

  return mode === "inactive" ? plans.filter((plan) => !plan.active) : plans;
}

async function searchPlans(
  mode: PlansQueryMode,
  search: string,
  pagination: PageRequest,
): Promise<PageResponse<Plan>> {
  const plans = await fetchAllPlansForSearch(mode);

  return paginatePlans(
    plans.filter((plan) => matchesSearch(plan, search)),
    pagination,
  );
}

export function useGetPlans(
  mode: PlansQueryMode = "active",
  search = "",
  pagination: PageRequest = DEFAULT_PLANS_PAGE,
) {
  return useQuery({
    queryKey: ["plans", mode, search, pagination],
    queryFn: () =>
      search.trim()
        ? searchPlans(mode, search, pagination)
        : mode === "inactive"
          ? fetchInactivePlans(pagination)
          : fetchPlans(mode, pagination),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import type { PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

async function fetchPlanOptions(search: string, page: number) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE),
    status: "ACTIVE",
  });

  if (search.trim()) params.set("q", search.trim());

  const response = await authFetch(`plans?${params.toString()}`);

  return parseApiResponse<PageResponse<Plan>>(
    response,
    "Erro ao buscar opções de planos",
  );
}

export function useGetPlanOptions(search = "", enabled = true) {
  const query = useInfiniteQuery({
    queryKey: ["plans", "options", search],
    queryFn: ({ pageParam = 0 }) => fetchPlanOptions(search, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const plans = query.data?.pages.flatMap((page) => page.content) ?? [];

  return {
    ...query,
    data: Array.from(
      new Map(plans.map((plan) => [plan.planId, plan] as const)).values(),
    ),
  };
}

import type { Payment } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import type { PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 5;

async function fetchMyPayments(page: number): Promise<PageResponse<Payment>> {
  const response = await authFetch(
    `payments/me?${buildPaginationParams({
      page,
      size: PAGE_SIZE,
      sort: "dueDate,desc",
    })}`,
  );

  return parseApiResponse(response, "Erro ao buscar meus pagamentos");
}

export function useGetMyPayments() {
  const query = useInfiniteQuery({
    queryKey: ["payments", "me"],
    queryFn: ({ pageParam = 0 }) => fetchMyPayments(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.content) ?? [],
  };
}


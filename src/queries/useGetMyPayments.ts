import type { Payment } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_MY_PAYMENTS_PAGE: PageRequest = {
  page: 0,
  size: 5,
  sort: "dueDate,desc",
};

async function fetchMyPayments(
  pagination: PageRequest,
): Promise<PageResponse<Payment>> {
  const response = await authFetch(
    `payments/me?${buildPaginationParams(pagination)}`,
  );

  return parseApiResponse(response, "Erro ao buscar meus pagamentos");
}

export function useGetMyPayments(
  pagination: PageRequest = DEFAULT_MY_PAYMENTS_PAGE,
) {
  return useQuery({
    queryKey: ["payments", "me", pagination],
    queryFn: () => fetchMyPayments(pagination),
    staleTime: 2 * 60 * 1000,
  });
}

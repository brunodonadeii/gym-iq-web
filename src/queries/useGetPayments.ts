import type { Payment } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type PaymentsQuery =
  | { mode: "all" }
  | { mode: "overdue" }
  | { mode: "student"; studentId: string }
  | { mode: "enrollment"; enrollmentId: string };

const getPaymentsUrl = (query: PaymentsQuery) => {
  if (query.mode === "overdue") return "payments/overdue";
  if (query.mode === "student") return `payments/student/${query.studentId}`;
  if (query.mode === "enrollment") {
    return `payments/enrollment/${query.enrollmentId}`;
  }

  return "payments";
};

const getDefaultSort = (query: PaymentsQuery) =>
  query.mode === "overdue" ? "dueDate,asc" : "dueDate,desc";

async function fetchPayments(
  query: PaymentsQuery,
  pagination: PageRequest,
): Promise<PageResponse<Payment>> {
  const request = {
    ...pagination,
    sort: pagination.sort ?? getDefaultSort(query),
  };
  const response = await authFetch(
    `${getPaymentsUrl(query)}?${buildPaginationParams(request)}`,
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar pagamentos");
  }

  return response.json();
}

export function useGetPayments(
  query: PaymentsQuery,
  enabled = true,
  pagination: PageRequest = { page: 0, size: 10 },
) {
  return useQuery({
    queryKey: ["payments", query, pagination],
    queryFn: () => fetchPayments(query, pagination),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

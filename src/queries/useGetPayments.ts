import type { Payment, PaymentStatus } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type PaymentsQuery =
  | { mode: "all" }
  | { mode: "student"; studentId: string }
  | { mode: "enrollment"; enrollmentId: string };

type PaymentsQueryWithStatus = PaymentsQuery & {
  status?: PaymentStatus;
};

const getPaymentsUrl = (query: PaymentsQuery) => {
  if (query.mode === "student") return `payments/student/${query.studentId}`;
  if (query.mode === "enrollment") {
    return `payments/enrollment/${query.enrollmentId}`;
  }

  return "payments";
};

const getDefaultSort = () => "dueDate,desc";

async function fetchPayments(
  query: PaymentsQueryWithStatus,
  pagination: PageRequest,
): Promise<PageResponse<Payment>> {
  const { status, ...paymentsQuery } = query;
  const request = {
    ...pagination,
    sort: pagination.sort ?? getDefaultSort(),
  };
  const response = await authFetch(
    `${getPaymentsUrl(paymentsQuery)}?${buildPaginationParams(request, {
      status,
    })}`,
  );

  return parseApiResponse(response, "Erro ao buscar pagamentos");
}

export function useGetPayments(
  query: PaymentsQueryWithStatus,
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


import type { Payment, PaymentStatus } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type PaymentsQuery =
  | { mode: "all" }
  | { mode: "overdue" }
  | { mode: "student"; studentId: string }
  | { mode: "enrollment"; enrollmentId: string };

type PaymentsQueryWithStatus = PaymentsQuery & {
  status?: PaymentStatus;
};

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

const paginatePayments = (
  content: Payment[],
  pagination: PageRequest,
): PageResponse<Payment> => {
  const size = pagination.size ?? 10;
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

async function fetchPaymentsByStatus(
  query: PaymentsQuery,
  status: PaymentStatus,
  pagination: PageRequest,
): Promise<PageResponse<Payment>> {
  const pageSize = 100;
  const payments: Payment[] = [];
  let currentPage = 0;
  let last = false;

  while (!last) {
    const response = await fetchPayments(query, {
      ...pagination,
      page: currentPage,
      size: pageSize,
    });

    payments.push(...response.content);
    last = response.last;
    currentPage += 1;
  }

  return paginatePayments(
    payments.filter((payment) => payment.status === status),
    pagination,
  );
}

export function useGetPayments(
  query: PaymentsQueryWithStatus,
  enabled = true,
  pagination: PageRequest = { page: 0, size: 10 },
) {
  const { status, ...paymentsQuery } = query;

  return useQuery({
    queryKey: ["payments", query, pagination],
    queryFn: () =>
      status
        ? fetchPaymentsByStatus(paymentsQuery, status, pagination)
        : fetchPayments(paymentsQuery, pagination),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

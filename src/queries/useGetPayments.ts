import type { Payment } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

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

async function fetchPayments(query: PaymentsQuery): Promise<Payment[]> {
  const response = await authFetch(getPaymentsUrl(query));

  if (!response.ok) {
    throw new Error("Erro ao buscar pagamentos");
  }

  return response.json();
}

export function useGetPayments(query: PaymentsQuery, enabled = true) {
  return useQuery({
    queryKey: ["payments", query],
    queryFn: () => fetchPayments(query),
    enabled,
  });
}

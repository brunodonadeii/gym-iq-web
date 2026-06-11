import type { Payment } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchPayment(id: string): Promise<Payment> {
  const response = await authFetch(`payments/${id}`);

  return parseApiResponse<Payment>(response, "Erro ao buscar pagamento");
}

export function useGetPaymentById(id: string, enabled = true) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: () => fetchPayment(id),
    enabled,
  });
}


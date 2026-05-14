import type { Payment } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchPayment(id: string): Promise<Payment> {
  const response = await authFetch(`payments/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar pagamento");
  }

  return response.json();
}

export function useGetPaymentById(id: string, enabled = true) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: () => fetchPayment(id),
    enabled,
  });
}

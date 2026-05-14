import type { Payment, PaymentStatus } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

type UpdatePaymentStatusData = {
  id: string;
  newStatus: Extract<PaymentStatus, "OVERDUE">;
};

async function updatePaymentStatus({ id, newStatus }: UpdatePaymentStatusData) {
  const response = await authFetch(
    `payments/${id}/status?newStatus=${newStatus}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation<Payment, ApiError, UpdatePaymentStatusData>({
    mutationFn: updatePaymentStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
      });
    },
  });
}

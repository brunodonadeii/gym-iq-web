import type { Payment, PaymentStatus } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  return parseApiResponse<Payment>(response);
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


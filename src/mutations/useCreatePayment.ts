import type { Payment, PaymentCreateFormData } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createPayment(data: PaymentCreateFormData) {
  const payload = {
    enrollmentId: data.enrollmentId,
    dueDate: data.dueDate,
    ...(data.amount ? { amount: Number(data.amount) } : {}),
    ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
    ...(data.notes.trim() ? { notes: data.notes.trim() } : {}),
  };

  const response = await authFetch("payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation<Payment, ApiError, PaymentCreateFormData>({
    mutationFn: createPayment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
      });
    },
  });
}


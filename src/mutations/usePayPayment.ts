import type { Payment, PaymentPayFormData } from "@/pages/Payments/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type PayPaymentData = {
  id: string;
  data: PaymentPayFormData;
};

async function payPayment({ id, data }: PayPaymentData) {
  const paidAt =
    data.paidAt && data.paidAt.length === 16
      ? `${data.paidAt}:00`
      : data.paidAt;

  const payload = {
    ...(paidAt ? { paidAt } : {}),
    ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
    ...(data.notes.trim() ? { notes: data.notes.trim() } : {}),
  };

  const response = await authFetch(`payments/${id}/pay`, {
    method: "PATCH",
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

export function usePayPayment() {
  const queryClient = useQueryClient();

  return useMutation<Payment, ApiError, PayPaymentData>({
    mutationFn: payPayment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
      });
    },
  });
}


import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

type RenewEnrollmentData = {
  id: string;
  newPlanId: string;
};

async function renewEnrollment({ id, newPlanId }: RenewEnrollmentData) {
  const response = await authFetch(
    `enrollments/${id}/renew?newPlanId=${newPlanId}`,
    {
      method: "POST",
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

export function useRenewEnrollment() {
  const queryClient = useQueryClient();

  return useMutation<Enrollment, ApiError, RenewEnrollmentData>({
    mutationFn: renewEnrollment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments"],
      });
    },
  });
}

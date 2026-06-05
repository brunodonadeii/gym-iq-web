import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";


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

  return parseApiResponse<Enrollment>(response);
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


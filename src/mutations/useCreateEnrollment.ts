import type { Enrollment, EnrollmentCreateFormData } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createEnrollment(data: EnrollmentCreateFormData) {
  const payload = {
    studentId: data.studentId,
    planId: Number(data.planId),
    ...(data.startDate ? { startDate: data.startDate } : {}),
  };

  const response = await authFetch("enrollments", {
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

export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation<Enrollment, ApiError, EnrollmentCreateFormData>({
    mutationFn: createEnrollment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments"],
      });
    },
  });
}

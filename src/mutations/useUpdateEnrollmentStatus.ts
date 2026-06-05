import type { Enrollment, EnrollmentStatus } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateEnrollmentStatusData = {
  id: string;
  newStatus: EnrollmentStatus;
};

async function updateEnrollmentStatus({
  id,
  newStatus,
}: UpdateEnrollmentStatusData) {
  const response = await authFetch(
    `enrollments/${id}/status?newStatus=${newStatus}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return parseApiResponse<Enrollment>(response);
}

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();

  return useMutation<Enrollment, ApiError, UpdateEnrollmentStatusData>({
    mutationFn: updateEnrollmentStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments"],
      });
    },
  });
}


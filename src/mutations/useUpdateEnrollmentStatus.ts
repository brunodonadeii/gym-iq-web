import type { Enrollment, EnrollmentStatus } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

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

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
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

import type { Student, StudentCreateFormData } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createStudent(data: StudentCreateFormData) {
  const response = await authFetch("students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseApiResponse<Student>(response);
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation<Student, ApiError, StudentCreateFormData>({
    mutationFn: createStudent,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    },
  });
}


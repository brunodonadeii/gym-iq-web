import type { Student, StudentCreateFormData } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

async function createStudent(data: StudentCreateFormData) {
  const response = await authFetch("students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
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

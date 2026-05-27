import { invalidateStudentRelatedQueries } from "@/mutations/studentQueryInvalidation";
import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro?: string;
  mensagem?: string;
  message?: string;
}

async function anonymizeStudent({ id }: { id: string }) {
  const response = await authFetch(`students/${id}/anonymize`, {
    method: "PATCH",
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useAnonymizeStudent() {
  const queryClient = useQueryClient();

  return useMutation<Student, ApiError, { id: string }>({
    mutationFn: anonymizeStudent,

    onSuccess: async (_, variables) => {
      await invalidateStudentRelatedQueries(queryClient, variables.id);
    },
  });
}

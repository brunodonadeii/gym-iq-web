import { invalidateStudentRelatedQueries } from "@/mutations/studentQueryInvalidation";
import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteStudentPersonalData({ id }: { id: string }) {
  const response = await authFetch(`students/${id}/personal-data`, {
    method: "DELETE",
  });

  return parseApiResponse<Student>(response);
}

export function useDeleteStudentPersonalData() {
  const queryClient = useQueryClient();

  return useMutation<Student, ApiError, { id: string }>({
    mutationFn: deleteStudentPersonalData,
    onSuccess: async (_, variables) => {
      await invalidateStudentRelatedQueries(queryClient, variables.id);
    },
  });
}


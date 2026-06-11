import { invalidateStudentRelatedQueries } from "@/mutations/studentQueryInvalidation";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deactivateStudent({ id }: { id: string }) {
  const response = await authFetch(`students/${id}/inactive`, {
    method: "PATCH",
  });

  return parseApiResponse<unknown>(response);
}

export function useDeactivateStudent() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, { id: string }>({
    mutationFn: deactivateStudent,

    onSuccess: async (_, variables) => {
      await invalidateStudentRelatedQueries(queryClient, variables.id);
    },
  });
}


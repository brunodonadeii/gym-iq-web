import { invalidateStudentRelatedQueries } from "@/mutations/studentQueryInvalidation";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deactivateStudent({ id }: { id: string }) {
  const response = await authFetch(`students/${id}/inactive`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw await response.json();
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
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

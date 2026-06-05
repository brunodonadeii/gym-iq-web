import { invalidateStudentRelatedQueries } from "@/mutations/studentQueryInvalidation";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function activateStudent({ id }: { id: string }) {
  const response = await authFetch(`students/${id}/active`, {
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

export function useActivateStudent() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, { id: string }>({
    mutationFn: activateStudent,

    onSuccess: async (_, variables) => {
      await invalidateStudentRelatedQueries(queryClient, variables.id);
    },
  });
}


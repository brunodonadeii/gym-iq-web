import { invalidateStudentRelatedQueries } from "@/mutations/studentQueryInvalidation";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function activateStudent({ id }: { id: string }) {
  const response = await authFetch(`students/${id}/active`, {
    method: "PATCH",
  });

  return parseApiResponse<unknown>(response);
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


import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deactivateInstructor({ id }: { id: string }) {
  const response = await authFetch(`instructors/${id}/inactive`, {
    method: "PATCH",
  });

  return parseApiResponse<unknown>(response);
}

export function useDeactivateInstructor() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, { id: string }>({
    mutationFn: deactivateInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructors"],
      });
    },
  });
}

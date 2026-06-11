import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function activateInstructor({ id }: { id: string }) {
  const response = await authFetch(`instructors/${id}/activate`, {
    method: "PATCH",
  });

  return parseApiResponse<unknown>(response);
}

export function useActivateInstructor() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, { id: string }>({
    mutationFn: activateInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructors"],
      });
    },
  });
}

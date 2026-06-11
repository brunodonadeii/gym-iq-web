import { authFetch } from "@/services/api";
import { parseApiVoidResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteAdminUser(id: string) {
  const response = await authFetch(`users/${id}`, {
    method: "DELETE",
  });

  return parseApiVoidResponse(response);
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string }>({
    mutationFn: ({ id }) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}


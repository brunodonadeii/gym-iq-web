import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

async function deleteAdminUser(id: string) {
  const response = await authFetch(`users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const responseData = await response.json();
    throw responseData;
  }
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

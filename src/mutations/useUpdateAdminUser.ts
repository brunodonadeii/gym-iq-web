import type {
  AdminUser,
  AdminUserUpdateFormData,
} from "@/pages/AdminUsers/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

type UpdateAdminUserVariables = {
  id: string;
  data: AdminUserUpdateFormData;
};

async function updateAdminUser({ id, data }: UpdateAdminUserVariables) {
  const response = await authFetch(`users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, ApiError, UpdateAdminUserVariables>({
    mutationFn: updateAdminUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

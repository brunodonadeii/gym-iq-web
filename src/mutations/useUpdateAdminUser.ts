import type {
  AdminUser,
  AdminUserUpdateFormData,
} from "@/pages/AdminUsers/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateAdminUserVariables = {
  id: string;
  data: AdminUserUpdateFormData;
};

async function updateAdminUser({ id, data }: UpdateAdminUserVariables) {
  const payload = {
    name: data.name,
    email: data.email,
    role: data.role,
  };

  const response = await authFetch(`users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return parseApiResponse<AdminUser>(response);
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


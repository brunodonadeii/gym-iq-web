import type {
  AdminUser,
  AdminUserCreateFormData,
} from "@/pages/AdminUsers/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createAdminUser(data: AdminUserCreateFormData) {
  const response = await authFetch("users", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, ApiError, AdminUserCreateFormData>({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}

import type { AdminUser } from "@/pages/AdminUsers/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchAdminUserById(id?: string): Promise<AdminUser> {
  const response = await authFetch(`users/${id}`);

  return parseApiResponse(response, "Erro ao buscar usuario administrativo");
}

export function useGetAdminUserById(id?: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchAdminUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

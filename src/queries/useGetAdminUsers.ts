import type { AdminUser } from "@/pages/AdminUsers/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type AdminUserRoleFilter = "ALL" | AdminUser["role"];

async function fetchAdminUsers(
  search: string,
  role: AdminUserRoleFilter,
  pagination: PageRequest,
): Promise<PageResponse<AdminUser>> {
  const response = await authFetch(
    `users?${buildPaginationParams(pagination, {
      q: search.trim() || undefined,
      role,
    })}`,
  );

  return parseApiResponse(response, "Erro ao buscar usuários administrativos");
}

export function useGetAdminUsers(
  search: string,
  role: AdminUserRoleFilter,
  pagination: PageRequest,
) {
  return useQuery({
    queryKey: ["users", search, role, pagination],
    queryFn: () => fetchAdminUsers(search, role, pagination),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


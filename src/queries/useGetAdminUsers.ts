import type { AdminUser } from "@/pages/AdminUsers/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

async function fetchAdminUsers(
  pagination: PageRequest,
): Promise<PageResponse<AdminUser>> {
  const response = await authFetch(`users?${buildPaginationParams(pagination)}`);

  return parseApiResponse(response, "Erro ao buscar usuarios administrativos");
}

const paginateUsers = (
  content: AdminUser[],
  pagination: PageRequest,
): PageResponse<AdminUser> => {
  const size = pagination.size ?? 10;
  const page = pagination.page ?? 0;
  const start = page * size;
  const pageContent = content.slice(start, start + size);
  const totalPages = Math.ceil(content.length / size);

  return {
    content: pageContent,
    totalElements: content.length,
    totalPages,
    size,
    number: page,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
  };
};

async function searchAdminUsers(
  search: string,
  pagination: PageRequest,
): Promise<PageResponse<AdminUser>> {
  const normalizedSearch = search.trim().toLowerCase();
  const users: AdminUser[] = [];
  let currentPage = 0;
  let last = false;

  while (!last) {
    const response = await fetchAdminUsers({
      ...pagination,
      page: currentPage,
      size: 100,
    });

    users.push(...response.content);
    last = response.last;
    currentPage += 1;
  }

  return paginateUsers(
    users.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    ),
    pagination,
  );
}

export function useGetAdminUsers(search: string, pagination: PageRequest) {
  return useQuery({
    queryKey: ["users", search, pagination],
    queryFn: () =>
      search.trim()
        ? searchAdminUsers(search, pagination)
        : fetchAdminUsers(pagination),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

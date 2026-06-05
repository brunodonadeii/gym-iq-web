import type { Instructor } from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type InstructorStatusFilter = "ACTIVE" | "INACTIVE" | "ALL";

const DEFAULT_INSTRUCTORS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "user.name,asc",
};

async function fetchInstructors(
  search: string,
  status: InstructorStatusFilter,
  pagination: PageRequest,
): Promise<PageResponse<Instructor>> {
  const query = buildPaginationParams(pagination, {
    ...(search ? { q: search } : {}),
    status,
  });
  const url = search ? `instructors/search?${query}` : `instructors?${query}`;
  const response = await authFetch(url);

  return parseApiResponse<PageResponse<Instructor>>(
    response,
    "Erro ao buscar instrutores",
  );
}

export function useGetInstructors(
  search: string,
  status: InstructorStatusFilter = "ACTIVE",
  pagination: PageRequest = DEFAULT_INSTRUCTORS_PAGE,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "instructors",
      {
        page: pagination.page,
        size: pagination.size,
        search,
        status,
      },
    ],
    queryFn: () => fetchInstructors(search, status, pagination),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


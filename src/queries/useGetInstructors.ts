import type { Instructor } from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const DEFAULT_INSTRUCTORS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "user.name,asc",
};

async function fetchInstructors(
  search: string,
  pagination: PageRequest,
): Promise<PageResponse<Instructor>> {
  const query = buildPaginationParams(pagination, search ? { q: search } : {});
  const url = search ? `instructors/search?${query}` : `instructors?${query}`;
  const response = await authFetch(url);

  if (!response.ok) {
    throw new Error("Erro ao buscar instrutores");
  }

  return response.json();
}

export function useGetInstructors(
  search: string,
  pagination: PageRequest = DEFAULT_INSTRUCTORS_PAGE,
) {
  return useQuery({
    queryKey: ["instructors", search, pagination],
    queryFn: () => fetchInstructors(search, pagination),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

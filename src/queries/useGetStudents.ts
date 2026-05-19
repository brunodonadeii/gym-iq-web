import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const DEFAULT_STUDENTS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "user.name,asc",
};

export const STUDENTS_QUERY_STALE_TIME = 5 * 60 * 1000;
export const STUDENTS_QUERY_GC_TIME = 15 * 60 * 1000;

export async function fetchStudents(
  search: string,
  pagination: PageRequest,
): Promise<PageResponse<Student>> {
  const query = buildPaginationParams(pagination, search ? { q: search } : {});
  const url = search ? `students/search?${query}` : `students?${query}`;
  const response = await authFetch(url);

  if (!response.ok) {
    throw new Error("Erro ao buscar alunos");
  }

  return response.json();
}

export function useGetStudents(
  search: string,
  pagination: PageRequest = DEFAULT_STUDENTS_PAGE,
) {
  return useQuery({
    queryKey: ["students", search, pagination],
    queryFn: () => fetchStudents(search, pagination),
    placeholderData: keepPreviousData,
    staleTime: STUDENTS_QUERY_STALE_TIME,
    gcTime: STUDENTS_QUERY_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

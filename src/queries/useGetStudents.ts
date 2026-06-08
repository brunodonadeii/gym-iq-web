import type { StudentSummary } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const DEFAULT_STUDENTS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "user.name,asc",
};

export const STUDENTS_QUERY_STALE_TIME = 5 * 60 * 1000;
export const STUDENTS_QUERY_GC_TIME = 15 * 60 * 1000;
export type StudentStatusQuery = "ALL" | "ACTIVE" | "INACTIVE";

export async function fetchStudents(
  search: string,
  status: StudentStatusQuery,
  pagination: PageRequest,
): Promise<PageResponse<StudentSummary>> {
  const query = buildPaginationParams(pagination, {
    ...(search ? { q: search } : {}),
    status,
  });
  const url = search ? `students/search?${query}` : `students?${query}`;
  const response = await authFetch(url);

  return parseApiResponse(response, "Erro ao buscar alunos");
}

export function useGetStudents(
  search: string,
  status: StudentStatusQuery,
  pagination: PageRequest = DEFAULT_STUDENTS_PAGE,
) {
  return useQuery({
    queryKey: ["students", search, status, pagination],
    queryFn: () => fetchStudents(search, status, pagination),
    placeholderData: keepPreviousData,
    staleTime: STUDENTS_QUERY_STALE_TIME,
    gcTime: STUDENTS_QUERY_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

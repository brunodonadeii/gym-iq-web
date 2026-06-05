import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const DEFAULT_STUDENT_ENROLLMENTS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "createdAt,desc",
};

async function fetchStudentEnrollments(
  studentId: string,
  pagination: PageRequest,
): Promise<PageResponse<Enrollment>> {
  const response = await authFetch(
    `enrollments/student/${studentId}?${buildPaginationParams(pagination)}`,
  );

  return parseApiResponse<PageResponse<Enrollment>>(response, "Erro ao buscar matrículas do aluno");
}

export function useGetStudentEnrollments(
  studentId: string,
  enabled: boolean,
  pagination: PageRequest = DEFAULT_STUDENT_ENROLLMENTS_PAGE,
) {
  return useQuery({
    queryKey: ["enrollments", "student", studentId, pagination],
    queryFn: () => fetchStudentEnrollments(studentId, pagination),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}



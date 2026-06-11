import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type EnrollmentStatusFilter = "ACTIVE" | "SUSPENDED" | "CANCELED";

const DEFAULT_ENROLLMENTS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "createdAt,desc",
};

async function fetchEnrollments(
  status: EnrollmentStatusFilter | undefined,
  pagination: PageRequest,
): Promise<PageResponse<Enrollment>> {
  const response = await authFetch(
    `enrollments?${buildPaginationParams(pagination, { status })}`,
  );

  return parseApiResponse<PageResponse<Enrollment>>(
    response,
    "Erro ao buscar matrículas",
  );
}

export function useGetEnrollments(
  status?: EnrollmentStatusFilter,
  pagination: PageRequest = DEFAULT_ENROLLMENTS_PAGE,
) {
  return useQuery({
    queryKey: ["enrollments", status, pagination],
    queryFn: () => fetchEnrollments(status, pagination),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

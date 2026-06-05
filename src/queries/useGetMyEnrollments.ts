import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_MY_ENROLLMENTS_PAGE: PageRequest = {
  page: 0,
  size: 5,
  sort: "createdAt,desc",
};

async function fetchMyEnrollments(
  pagination: PageRequest,
): Promise<PageResponse<Enrollment>> {
  const response = await authFetch(
    `enrollments/me?${buildPaginationParams(pagination)}`,
  );

  return parseApiResponse(response, "Erro ao buscar minhas matrículas");
}

export function useGetMyEnrollments(
  pagination: PageRequest = DEFAULT_MY_ENROLLMENTS_PAGE,
) {
  return useQuery({
    queryKey: ["enrollments", "me", pagination],
    queryFn: () => fetchMyEnrollments(pagination),
    staleTime: 2 * 60 * 1000,
  });
}


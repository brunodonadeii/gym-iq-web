import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const DEFAULT_ENROLLMENTS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "createdAt,desc",
};

async function fetchEnrollments(
  pagination: PageRequest,
): Promise<PageResponse<Enrollment>> {
  const response = await authFetch(
    `enrollments?${buildPaginationParams(pagination)}`,
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar matrículas");
  }

  return response.json();
}

export function useGetEnrollments(
  pagination: PageRequest = DEFAULT_ENROLLMENTS_PAGE,
) {
  return useQuery({
    queryKey: ["enrollments", pagination],
    queryFn: () => fetchEnrollments(pagination),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

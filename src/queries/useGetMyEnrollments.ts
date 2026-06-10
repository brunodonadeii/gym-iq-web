import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import type { PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 5;

async function fetchMyEnrollments(page: number): Promise<PageResponse<Enrollment>> {
  const response = await authFetch(
    `enrollments/me?${buildPaginationParams({
      page,
      size: PAGE_SIZE,
      sort: "createdAt,desc",
    })}`,
  );

  return parseApiResponse(response, "Erro ao buscar minhas matrículas");
}

export function useGetMyEnrollments() {
  const query = useInfiniteQuery({
    queryKey: ["enrollments", "me"],
    queryFn: ({ pageParam = 0 }) => fetchMyEnrollments(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.content) ?? [],
  };
}


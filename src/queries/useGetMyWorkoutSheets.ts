import type { WorkoutSheetSummary } from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import type { PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 5;

async function fetchMyWorkoutSheets(page: number) {
  const response = await authFetch(
    `workout-sheets/me?${buildPaginationParams(
      {
        page,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      },
      { onlyActive: true },
    )}`,
  );

  return parseApiResponse<PageResponse<WorkoutSheetSummary>>(
    response,
    "Erro ao buscar minhas fichas",
  );
}

export function useGetMyWorkoutSheets() {
  const query = useInfiniteQuery({
    queryKey: ["workout-sheets", "me"],
    queryFn: ({ pageParam = 0 }) => fetchMyWorkoutSheets(pageParam),
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

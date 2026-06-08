import type { WorkoutSheetSummary } from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_MY_WORKOUT_SHEETS_PAGE: PageRequest = {
  page: 0,
  size: 5,
  sort: "createdAt,desc",
};

async function fetchMyWorkoutSheets(
  pagination: PageRequest,
): Promise<PageResponse<WorkoutSheetSummary>> {
  const response = await authFetch(
    `workout-sheets/me?${buildPaginationParams(pagination, {
      onlyActive: true,
    })}`,
  );

  return parseApiResponse(response, "Erro ao buscar minhas fichas");
}

export function useGetMyWorkoutSheets(
  pagination: PageRequest = DEFAULT_MY_WORKOUT_SHEETS_PAGE,
) {
  return useQuery({
    queryKey: ["workout-sheets", "me", pagination],
    queryFn: () => fetchMyWorkoutSheets(pagination),
    staleTime: 2 * 60 * 1000,
  });
}

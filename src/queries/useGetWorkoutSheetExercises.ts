import type { WorkoutSheetExercise } from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export async function fetchWorkoutSheetExercises(
  workoutSheetId: string,
  pagination: PageRequest,
): Promise<PageResponse<WorkoutSheetExercise>> {
  const response = await authFetch(
    `workout-sheets/${workoutSheetId}/exercises?${buildPaginationParams({
      sort: "executionOrder,asc",
      ...pagination,
    })}`,
  );

  return parseApiResponse<PageResponse<WorkoutSheetExercise>>(
    response,
    "Erro ao buscar exercícios da ficha",
  );
}

export function useGetWorkoutSheetExercises(
  workoutSheetId?: string,
  pagination: PageRequest = { page: 0, size: 10 },
  enabled = true,
) {
  return useQuery({
    queryKey: ["workout-sheets", workoutSheetId, "exercises", pagination],
    queryFn: () => fetchWorkoutSheetExercises(String(workoutSheetId), pagination),
    enabled: enabled && !!workoutSheetId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}



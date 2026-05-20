import type { WorkoutSheetExercise } from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

async function fetchWorkoutSheetExercises(
  workoutSheetId: string,
  pagination: PageRequest,
): Promise<PageResponse<WorkoutSheetExercise>> {
  const response = await authFetch(
    `workout-sheets/${workoutSheetId}/exercises?${buildPaginationParams({
      sort: "executionOrder,asc",
      ...pagination,
    })}`,
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar exercicios da ficha");
  }

  return response.json();
}

export function useGetWorkoutSheetExercises(
  workoutSheetId?: string,
  pagination: PageRequest = { page: 0, size: 10 },
) {
  return useQuery({
    queryKey: ["workout-sheets", workoutSheetId, "exercises", pagination],
    queryFn: () => fetchWorkoutSheetExercises(String(workoutSheetId), pagination),
    enabled: !!workoutSheetId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

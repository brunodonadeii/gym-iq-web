import type { WorkoutSheetSummary } from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type WorkoutSheetsQuery =
  | { mode: "all" }
  | { mode: "student"; studentId: string; onlyActive?: boolean }
  | { mode: "instructor"; instructorId: string };

const getWorkoutSheetsUrl = (query: WorkoutSheetsQuery) => {
  if (query.mode === "student") {
    return `workout-sheets/student/${query.studentId}`;
  }

  if (query.mode === "instructor") {
    return `workout-sheets/instructor/${query.instructorId}`;
  }

  return "workout-sheets";
};

export async function fetchWorkoutSheets(
  query: WorkoutSheetsQuery,
  pagination: PageRequest,
): Promise<PageResponse<WorkoutSheetSummary>> {
  const params = buildPaginationParams(
    { sort: "createdAt,desc", ...pagination },
    query.mode === "student" ? { onlyActive: query.onlyActive } : undefined,
  );
  const response = await authFetch(`${getWorkoutSheetsUrl(query)}?${params}`);

  return parseApiResponse(response, "Erro ao buscar fichas de treino");
}

export function useGetWorkoutSheets(
  query: WorkoutSheetsQuery,
  enabled = true,
  pagination: PageRequest = { page: 0, size: 10 },
) {
  return useQuery({
    queryKey: ["workout-sheets", query, pagination],
    queryFn: () => fetchWorkoutSheets(query, pagination),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

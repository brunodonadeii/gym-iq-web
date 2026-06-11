import type { WorkoutSheet } from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchWorkoutSheet(id: string): Promise<WorkoutSheet> {
  const response = await authFetch(`workout-sheets/${id}`);

  return parseApiResponse<WorkoutSheet>(response, "Erro ao buscar ficha de treino");
}

export function useGetWorkoutSheetById(id?: string) {
  return useQuery({
    queryKey: ["workout-sheets", id],
    queryFn: () => fetchWorkoutSheet(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


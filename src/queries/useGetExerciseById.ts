import type { Exercise } from "@/pages/Exercises/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchExercise(id: string): Promise<Exercise> {
  const response = await authFetch(`exercises/${id}`);

  return parseApiResponse<Exercise>(response, "Erro ao buscar exercício");
}

export function useGetExerciseById(id?: string) {
  return useQuery({
    queryKey: ["exercises", id],
    queryFn: () => fetchExercise(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}



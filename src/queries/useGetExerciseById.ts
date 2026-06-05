import type { Exercise } from "@/pages/Exercises/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchExercise(id: string): Promise<Exercise> {
  const response = await authFetch(`exercises/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar exercício");
  }

  return response.json();
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



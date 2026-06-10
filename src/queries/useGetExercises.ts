import type { Exercise } from "@/pages/Exercises/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type ExercisesQueryMode = "active" | "all";

const DEFAULT_EXERCISES_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "name,asc",
};

export async function fetchExercises(
  mode: ExercisesQueryMode,
  search: string,
  pagination: PageRequest,
): Promise<PageResponse<Exercise>> {
  const query = buildPaginationParams(pagination, search ? { q: search } : {});
  const baseUrl = search
    ? "exercises/search"
    : mode === "all"
      ? "exercises/all"
      : "exercises";
  const response = await authFetch(`${baseUrl}?${query}`);

  return parseApiResponse(response, "Erro ao buscar exercícios");
}

export function useGetExercises(
  mode: ExercisesQueryMode = "active",
  search = "",
  pagination: PageRequest = DEFAULT_EXERCISES_PAGE,
  enabled = true,
) {
  return useQuery({
    queryKey: ["exercises", mode, search, pagination],
    queryFn: () => fetchExercises(mode, search, pagination),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


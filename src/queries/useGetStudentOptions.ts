import type { StudentOption } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

async function fetchStudentOptions(search: string): Promise<StudentOption[]> {
  const query = search ? `?q=${encodeURIComponent(search)}` : "";
  const response = await authFetch(`students/options${query}`);

  return parseApiResponse<StudentOption[]>(response, "Erro ao buscar opções de alunos");
}

export function useGetStudentOptions(search = "", enabled = true) {
  return useQuery({
    queryKey: ["students", "options", search],
    queryFn: () => fetchStudentOptions(search),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


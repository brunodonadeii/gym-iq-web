import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchStudent(id: string): Promise<Student> {
  const response = await authFetch(`students/${id}`);

  return parseApiResponse<Student>(response, "Erro ao buscar alunos");
}

export function useGetStudentById(id: string) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => fetchStudent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


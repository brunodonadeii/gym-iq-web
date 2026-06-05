import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchStudent(id: string): Promise<Student> {
  const response = await authFetch(`students/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar alunos");
  }

  return response.json();
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


import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchStudents(search: string): Promise<Student[]> {
  const url = search ? `students/search?q=${search}` : "students";
  const response = await authFetch(url);

  if (!response.ok) {
    throw new Error("Erro ao buscar alunos");
  }

  return response.json();
}

export function useGetStudents(search: string) {
  return useQuery({
    queryKey: ["students", search],
    queryFn: () => fetchStudents(search),
  });
}

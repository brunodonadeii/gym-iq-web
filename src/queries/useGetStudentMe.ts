import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchStudentMe(): Promise<Student> {
  const response = await authFetch("students/me");

  return parseApiResponse(response, "Erro ao buscar dados do aluno");
}

export function useGetStudentMe() {
  return useQuery({
    queryKey: ["students", "me"],
    queryFn: fetchStudentMe,
    staleTime: 5 * 60 * 1000,
  });
}


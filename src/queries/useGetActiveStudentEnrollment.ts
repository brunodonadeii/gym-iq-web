import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchActiveStudentEnrollment(
  studentId: string,
): Promise<Enrollment | null> {
  const response = await authFetch(`enrollments/student/${studentId}/active`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar matrícula ativa do aluno");
  }

  return response.json();
}

export function useGetActiveStudentEnrollment(
  studentId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["enrollments", "student", studentId, "active"],
    queryFn: () => fetchActiveStudentEnrollment(studentId),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  const response = await authFetch(`enrollments/student/${studentId}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar matriculas do aluno");
  }

  return response.json();
}

export function useGetStudentEnrollments(studentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["enrollments", "student", studentId],
    queryFn: () => fetchStudentEnrollments(studentId),
    enabled,
  });
}

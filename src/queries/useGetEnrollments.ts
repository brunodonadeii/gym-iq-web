import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchEnrollments(): Promise<Enrollment[]> {
  const response = await authFetch("enrollments");

  if (!response.ok) {
    throw new Error("Erro ao buscar matriculas");
  }

  return response.json();
}

export function useGetEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: fetchEnrollments,
  });
}

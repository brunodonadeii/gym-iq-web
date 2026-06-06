import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchEnrollment(id: string): Promise<Enrollment> {
  const response = await authFetch(`enrollments/${id}`);

  return parseApiResponse<Enrollment>(response, "Erro ao buscar matrícula");
}

export function useGetEnrollmentById(id?: string) {
  return useQuery<Enrollment, ApiError, Enrollment>({
    queryKey: ["enrollments", id],
    queryFn: () => fetchEnrollment(String(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

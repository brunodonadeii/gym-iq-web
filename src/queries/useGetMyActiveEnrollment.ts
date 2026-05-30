import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { parseApiError, parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchMyActiveEnrollment(): Promise<Enrollment | null> {
  const response = await authFetch("enrollments/me/active");

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw await parseApiError(response, "Erro ao buscar matricula ativa");
  }

  return parseApiResponse(response, "Erro ao buscar matricula ativa");
}

export function useGetMyActiveEnrollment() {
  return useQuery({
    queryKey: ["enrollments", "me", "active"],
    queryFn: fetchMyActiveEnrollment,
    staleTime: 2 * 60 * 1000,
  });
}

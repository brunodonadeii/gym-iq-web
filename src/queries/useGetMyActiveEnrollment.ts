import type { Enrollment } from "@/pages/Enrollments/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchMyActiveEnrollment(): Promise<Enrollment | null> {
  const response = await authFetch("enrollments/me/active");

  if (response.status === 404) {
    return null;
  }

  return parseApiResponse<Enrollment | null>(
    response,
    "Erro ao buscar matrícula ativa",
  );
}

export function useGetMyActiveEnrollment() {
  return useQuery({
    queryKey: ["enrollments", "me", "active"],
    queryFn: fetchMyActiveEnrollment,
    staleTime: 2 * 60 * 1000,
  });
}


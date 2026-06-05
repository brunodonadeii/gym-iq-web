import type { Instructor } from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchMyInstructor(): Promise<Instructor> {
  const response = await authFetch("instructors/me");

  return parseApiResponse<Instructor>(response, "Erro ao buscar instrutor autenticado");
}

export function useGetMyInstructor(enabled = true) {
  return useQuery({
    queryKey: ["instructors", "me"],
    queryFn: fetchMyInstructor,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


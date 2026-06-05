import type { Instructor } from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchInstructor(id: string): Promise<Instructor> {
  const response = await authFetch(`instructors/${id}`);

  return parseApiResponse<Instructor>(response, "Erro ao buscar instrutor");
}

export function useGetInstructorById(id?: string) {
  return useQuery({
    queryKey: ["instructors", id],
    queryFn: () => fetchInstructor(id ?? ""),
    enabled: !!id,
  });
}


import type { Instructor } from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchInstructor(id: string): Promise<Instructor> {
  const response = await authFetch(`instructors/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar instrutor");
  }

  return response.json();
}

export function useGetInstructorById(id?: string) {
  return useQuery({
    queryKey: ["instructors", id],
    queryFn: () => fetchInstructor(id ?? ""),
    enabled: !!id,
  });
}

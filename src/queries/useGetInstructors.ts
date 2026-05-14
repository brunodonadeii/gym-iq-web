import type { Instructor } from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchInstructors(search: string): Promise<Instructor[]> {
  const url = search
    ? `instructors/search?q=${encodeURIComponent(search)}`
    : "instructors";
  const response = await authFetch(url);

  if (!response.ok) {
    throw new Error("Erro ao buscar instrutores");
  }

  return response.json();
}

export function useGetInstructors(search: string) {
  return useQuery({
    queryKey: ["instructors", search],
    queryFn: () => fetchInstructors(search),
  });
}

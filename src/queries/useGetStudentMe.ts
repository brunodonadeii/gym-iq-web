import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchStudentMe(): Promise<Student> {
  const response = await authFetch("students/me");

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}

export function useGetStudentMe() {
  return useQuery({
    queryKey: ["students", "me"],
    queryFn: fetchStudentMe,
    staleTime: 5 * 60 * 1000,
  });
}

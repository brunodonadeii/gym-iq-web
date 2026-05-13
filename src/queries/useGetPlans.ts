import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchPlans(): Promise<Plan[]> {
  const response = await authFetch("plans/all");

  if (!response.ok) {
    throw new Error("Erro ao buscar alunos");
  }

  return response.json();
}

export function useGetPlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });
}

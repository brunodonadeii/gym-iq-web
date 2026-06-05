import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchPlan(id: string): Promise<Plan> {
  const response = await authFetch(`plans/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar alunos");
  }

  return response.json();
}

export function useGetPlanById(id: string) {
  return useQuery({
    queryKey: ["plans", id],
    queryFn: () => fetchPlan(id),
    enabled: !!id,
  });
}


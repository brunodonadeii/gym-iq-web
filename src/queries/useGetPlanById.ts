import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

async function fetchPlan(id: string): Promise<Plan> {
  const response = await authFetch(`plans/${id}`);

  return parseApiResponse<Plan>(response, "Erro ao buscar plano");
}

export function useGetPlanById(id: string) {
  return useQuery({
    queryKey: ["plans", id],
    queryFn: () => fetchPlan(id),
    enabled: !!id,
  });
}


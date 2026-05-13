import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

type PlansQueryMode = "active" | "all";

async function fetchPlans(mode: PlansQueryMode): Promise<Plan[]> {
  const response = await authFetch(mode === "active" ? "plans" : "plans/all");

  if (!response.ok) {
    throw new Error("Erro ao buscar planos");
  }

  return response.json();
}

export function useGetPlans(mode: PlansQueryMode = "active") {
  return useQuery({
    queryKey: ["plans", mode],
    queryFn: () => fetchPlans(mode),
  });
}

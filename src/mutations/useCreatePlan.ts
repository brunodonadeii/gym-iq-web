import type { Plan, PlanFormData } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

interface CreatePlanData {
  data: PlanFormData;
}

async function createPlan({ data }: CreatePlanData) {
  const response = await authFetch(`plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation<Plan, ApiError, CreatePlanData>({
    mutationFn: createPlan,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
}

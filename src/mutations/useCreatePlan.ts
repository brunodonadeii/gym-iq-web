import type { Plan, PlanFormData } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  return parseApiResponse<Plan>(response);
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


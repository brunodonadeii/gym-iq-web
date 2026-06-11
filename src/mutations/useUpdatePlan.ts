import type { Plan, PlanFormData } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdatePlanData {
  id: string;
  data: PlanFormData;
}

async function updatePlan({ data, id }: UpdatePlanData) {
  const response = await authFetch(`plans/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseApiResponse<Plan>(response);
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation<Plan, ApiError, UpdatePlanData>({
    mutationFn: updatePlan,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
}


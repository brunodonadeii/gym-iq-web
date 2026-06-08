import type { WorkoutBlock } from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateWorkoutBlockData = {
  workoutSheetId: string;
  data: {
    name: string;
    description?: string;
    executionOrder: number | string;
  };
};

async function createWorkoutBlock({ workoutSheetId, data }: CreateWorkoutBlockData) {
  const response = await authFetch(`workout-sheets/${workoutSheetId}/blocks`, {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      description: data.description || undefined,
      executionOrder: Number(data.executionOrder),
    }),
  });

  return parseApiResponse<WorkoutBlock>(response);
}

export function useCreateWorkoutBlock() {
  const queryClient = useQueryClient();

  return useMutation<WorkoutBlock, ApiError, CreateWorkoutBlockData>({
    mutationFn: createWorkoutBlock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workout-sheets", variables.workoutSheetId],
      });
    },
  });
}

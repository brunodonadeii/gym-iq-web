import type {
  WorkoutSheet,
  WorkoutSheetFormData,
} from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateWorkoutSheetData = {
  id: string;
  data: WorkoutSheetFormData;
};

const normalizeWorkoutSheet = (data: WorkoutSheetFormData) => ({
  studentId: data.studentId,
  instructorId: data.instructorId,
  name: data.name,
  goal: data.goal || undefined,
  startDate: data.startDate || undefined,
  endDate: data.endDate || undefined,
  notes: data.notes || undefined,
  blocks: data.blocks?.map((block, blockIndex) => ({
    name: block.name,
    description: block.description || undefined,
    executionOrder: Number(block.executionOrder || blockIndex + 1),
    exercises: block.exercises.map((exercise, exerciseIndex) => ({
      exerciseId: Number(exercise.exerciseId),
      sets: Number(exercise.sets),
      repetitions: exercise.repetitions,
      loadKg: exercise.loadKg ? Number(exercise.loadKg) : undefined,
      restSeconds: exercise.restSeconds ? Number(exercise.restSeconds) : undefined,
      executionOrder: Number(exercise.executionOrder || exerciseIndex + 1),
      notes: exercise.notes || undefined,
    })),
  })),
});

async function updateWorkoutSheet({ id, data }: UpdateWorkoutSheetData) {
  const response = await authFetch(`workout-sheets/${id}`, {
    method: "PUT",
    body: JSON.stringify(normalizeWorkoutSheet(data)),
  });

  return parseApiResponse<WorkoutSheet>(response);
}

export function useUpdateWorkoutSheet() {
  const queryClient = useQueryClient();

  return useMutation<WorkoutSheet, ApiError, UpdateWorkoutSheetData>({
    mutationFn: updateWorkoutSheet,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout-sheets"] });
      queryClient.invalidateQueries({
        queryKey: ["workout-sheets", variables.id],
      });
    },
  });
}

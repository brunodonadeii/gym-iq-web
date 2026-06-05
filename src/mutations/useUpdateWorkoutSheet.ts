import type {
  WorkoutSheet,
  WorkoutSheetFormData,
} from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
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
  exercises: data.exercises.map((exercise) => ({
    exerciseId: Number(exercise.exerciseId),
    sets: Number(exercise.sets),
    repetitions: exercise.repetitions,
    loadKg: exercise.loadKg ? Number(exercise.loadKg) : undefined,
    restSeconds: exercise.restSeconds
      ? Number(exercise.restSeconds)
      : undefined,
    executionOrder: Number(exercise.executionOrder),
    notes: exercise.notes || undefined,
  })),
});

async function updateWorkoutSheet({ id, data }: UpdateWorkoutSheetData) {
  const response = await authFetch(`workout-sheets/${id}`, {
    method: "PUT",
    body: JSON.stringify(normalizeWorkoutSheet(data)),
  });
  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
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

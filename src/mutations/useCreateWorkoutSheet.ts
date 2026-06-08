import type {
  WorkoutSheet,
  WorkoutSheetFormData,
} from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const normalizeExercise = (exercise: WorkoutSheetFormData["blocks"][number]["exercises"][number]) => ({
  exerciseId: Number(exercise.exerciseId),
  sets: Number(exercise.sets),
  repetitions: exercise.repetitions,
  loadKg: exercise.loadKg ? Number(exercise.loadKg) : undefined,
  restSeconds: exercise.restSeconds ? Number(exercise.restSeconds) : undefined,
  executionOrder: Number(exercise.executionOrder),
  notes: exercise.notes || undefined,
});

const normalizeWorkoutSheet = (data: WorkoutSheetFormData) => ({
  studentId: data.studentId,
  instructorId: data.instructorId,
  name: data.name,
  goal: data.goal || undefined,
  startDate: data.startDate || undefined,
  endDate: data.endDate || undefined,
  notes: data.notes || undefined,
  blocks: data.blocks.map((block, blockIndex) => ({
    name: block.name,
    description: block.description || undefined,
    executionOrder: Number(block.executionOrder || blockIndex + 1),
    exercises: block.exercises.map((exercise, exerciseIndex) =>
      normalizeExercise({
        ...exercise,
        executionOrder: exercise.executionOrder || String(exerciseIndex + 1),
      }),
    ),
  })),
});

async function createWorkoutSheet({ data }: { data: WorkoutSheetFormData }) {
  const response = await authFetch("workout-sheets", {
    method: "POST",
    body: JSON.stringify(normalizeWorkoutSheet(data)),
  });

  return parseApiResponse<WorkoutSheet>(response);
}

export function useCreateWorkoutSheet() {
  const queryClient = useQueryClient();

  return useMutation<WorkoutSheet, ApiError, { data: WorkoutSheetFormData }>({
    mutationFn: createWorkoutSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-sheets"] });
    },
  });
}

export type Exercise = {
  exerciseId: number;
  name: string;
  muscleGroup: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseFormData = {
  name: string;
  muscleGroup: string;
  description: string;
};

export const EXERCISE_LIMITS = {
  name: 100,
  muscleGroup: 80,
  description: 255,
} as const;


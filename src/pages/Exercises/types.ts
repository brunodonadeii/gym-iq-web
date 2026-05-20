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

export type WorkoutSheet = {
  workoutSheetId: string;
  studentId: string;
  studentName: string;
  instructorId: string;
  instructorName: string;
  name: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
  notes?: string | null;
  exercises?: WorkoutSheetExercise[];
  createdAt: string;
  updatedAt: string;
  studentEmail?: string;
  student?: {
    studentId?: string;
    name?: string;
    email?: string;
  };
  instructor?: {
    instructorId?: string;
    name?: string;
    email?: string;
  };
};

export type WorkoutSheetFormData = {
  studentId: string;
  instructorId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  notes: string;
  exercises: WorkoutSheetExerciseFormData[];
};

export type WorkoutSheetExercise = {
  workoutSheetExerciseId: string;
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  sets: number | string;
  repetitions: string;
  loadKg?: number | string | null;
  restSeconds?: number | string | null;
  executionOrder: number | string;
  notes?: string | null;
};

export type WorkoutSheetExerciseFormData = {
  exerciseId: string;
  sets: string;
  repetitions: string;
  loadKg: string;
  restSeconds: string;
  executionOrder: string;
  notes: string;
};

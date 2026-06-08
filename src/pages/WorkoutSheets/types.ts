export type WorkoutSheetSummary = {
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

export type WorkoutSheet = WorkoutSheetSummary & {
  exercises?: WorkoutSheetExercise[];
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

export type WorkoutSheetSectionFormData = {
  name: string;
  exercises: WorkoutSheetExerciseFormData[];
};

export type WorkoutSheetSectionsFormData = Omit<
  WorkoutSheetFormData,
  "exercises"
> & {
  sections: WorkoutSheetSectionFormData[];
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
  trainingSection: string;
  executionOrder: number | string;
  notes?: string | null;
};

export type WorkoutSheetExerciseFormData = {
  exerciseId: string;
  sets: string;
  repetitions: string;
  loadKg: string;
  restSeconds: string;
  trainingSection: string;
  executionOrder: string;
  notes: string;
};

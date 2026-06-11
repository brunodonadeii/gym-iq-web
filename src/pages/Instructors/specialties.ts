export const INSTRUCTOR_SPECIALTY_OPTIONS = [
  "Musculação",
  "Hipertrofia",
  "Emagrecimento",
  "Treinamento funcional",
  "Mobilidade",
  "Reabilitação",
  "Condicionamento físico",
  "Treinamento esportivo",
] as const;

export const normalizeInstructorSpecialty = (value?: string | null) =>
  (value ?? "").split(",")[0]?.trim() ?? "";



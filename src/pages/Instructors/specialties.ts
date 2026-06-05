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

export const parseInstructorSpecialties = (value?: string | null) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const stringifyInstructorSpecialties = (values: string[]) =>
  values.join(", ");



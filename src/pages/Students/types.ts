export type StudentBaseFormData = {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  zipCode: string;
  address: string;
};

export type StudentSummary = {
  active: boolean;
  createdAt: string;
  email: string;
  lgpdAccepted: boolean;
  name: string;
  studentId: string;
  userId: string;
};

export type Student = StudentSummary & {
  address?: string | null;
  birthDate?: string | null;
  cpf: string;
  phone: string;
  zipCode?: string | null;
};

export type StudentUpdateFormData = StudentBaseFormData;

export type StudentEditFormData = StudentUpdateFormData;

export type StudentCreateFormData = StudentBaseFormData & {
  password: string;
  lgpdAccepted: boolean;
};

export type StudentOption = {
  studentId: string;
  name: string;
  email: string;
  cpf: string;
  label: string;
};

export const getStudentOptionLabel = (student: StudentOption) =>
  student.label?.trim() || student.name;

const ANONYMIZED_SENTINELS = new Set([
  "ANONYMIZED",
  "CPF ANONYMIZED",
  "EMAIL ANONYMIZED",
  "PHONE ANONYMIZED",
  "ADDRESS ANONYMIZED",
]);

const hasAnonymizedSentinel = (value?: string | null) =>
  value ? ANONYMIZED_SENTINELS.has(value.trim().toUpperCase()) : false;

type AnonymizedStudentCandidate = Partial<
  Pick<Student, "address" | "birthDate" | "cpf" | "email" | "phone">
>;

export const isAnonymizedStudent = (
  student?: AnonymizedStudentCandidate | null,
) =>
  hasAnonymizedSentinel(student?.phone) ||
  hasAnonymizedSentinel(student?.cpf) ||
  hasAnonymizedSentinel(student?.email) ||
  hasAnonymizedSentinel(student?.address) ||
  student?.birthDate === "1900-01-01";


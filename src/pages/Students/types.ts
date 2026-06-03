export type StudentBaseFormData = {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  zipCode: string;
  address: string;
};

export type Student = {
  active: boolean;
  address?: string | null;
  birthDate?: string | null;
  cpf: string;
  createdAt: string;
  email: string;
  lgpdAccepted: boolean;
  name: string;
  phone: string;
  studentId: number;
  userId: string;
  zipCode?: string | null;
};

export type StudentUpdateFormData = StudentBaseFormData;

export type StudentEditFormData = StudentUpdateFormData;

export type StudentCreateFormData = StudentBaseFormData & {
  password: string;
  lgpdAccepted: boolean;
};

export type StudentOption = {
  studentId: number;
  name: string;
  email: string;
  cpf: string;
  label: string;
};

const ANONYMIZED_SENTINELS = new Set([
  "ANONYMIZED",
  "CPF ANONYMIZED",
  "EMAIL ANONYMIZED",
  "PHONE ANONYMIZED",
  "ADDRESS ANONYMIZED",
]);

const hasAnonymizedSentinel = (value?: string | null) =>
  value ? ANONYMIZED_SENTINELS.has(value.trim().toUpperCase()) : false;

export const isAnonymizedStudent = (student?: Student | null) =>
  hasAnonymizedSentinel(student?.phone) ||
  hasAnonymizedSentinel(student?.cpf) ||
  hasAnonymizedSentinel(student?.email) ||
  hasAnonymizedSentinel(student?.address) ||
  student?.birthDate === "1900-01-01";

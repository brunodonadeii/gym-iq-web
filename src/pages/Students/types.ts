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
  address: string | null;
  birthDate: string;
  cpf: string;
  createdAt: string;
  email: string;
  lgpdAccepted: boolean;
  name: string;
  phone: string;
  studentId: number;
  userId: number;
  zipCode: string | null;
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

export const isAnonymizedStudent = (student?: Student | null) =>
  student?.phone === "ANONYMIZED" || student?.birthDate === "1900-01-01";

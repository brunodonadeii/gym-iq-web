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
  anonymized: boolean;
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

export const isAnonymizedStudent = (
  student?: Pick<StudentSummary, "anonymized"> | null,
) => student?.anonymized === true;


export type StudentEditFormData = {
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
  address: string;
  birthDate: string;
  cpf: string;
  createdAt: string;
  email: string;
  lgpdAccepted: boolean;
  name: string;
  phone: string;
  studentId: number;
  userId: number;
  zipCode: string;
};

export type StudentCreateFormData = StudentEditFormData & {
  password: string;
};

export type StudentOption = {
  studentId: number;
  name: string;
  email: string;
  cpf: string;
  label: string;
};

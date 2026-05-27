export type Instructor = {
  instructorId: number;
  userId: number;
  name: string;
  email: string;
  cref: string;
  phone: string;
  specialty?: string | null;
  active: boolean;
  lgpdAccepted: boolean;
  createdAt: string;
};

export type InstructorCreateFormData = {
  name: string;
  email: string;
  password: string;
  cref: string;
  phone: string;
  specialty: string;
  lgpdAccepted: boolean;
};

export type InstructorUpdateFormData = {
  name: string;
  email: string;
  cref: string;
  phone: string;
  specialty: string;
  lgpdAccepted: boolean;
};

export type InstructorEditFormData = InstructorUpdateFormData;

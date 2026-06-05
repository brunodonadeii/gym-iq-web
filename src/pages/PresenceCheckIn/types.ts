export type SelfCheckInFormData = {
  identifier: string;
  password: string;
};

export type SelfCheckInPayload = SelfCheckInFormData & {
  notes?: string;
};

export type PresenceCheckInResponse = {
  presenceId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  checkInAt: string;
  checkOutAt?: string | null;
  notes?: string | null;
  createdAt: string;
};


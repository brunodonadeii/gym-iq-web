export type Presence = {
  presenceId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  checkInAt: string;
  checkOutAt?: string | null;
  notes?: string | null;
  createdAt: string;
};


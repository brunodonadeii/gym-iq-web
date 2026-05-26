export type Presence = {
  presenceId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  checkInAt: string;
  checkOutAt?: string | null;
  notes?: string | null;
  createdAt: string;
};

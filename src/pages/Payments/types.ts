import type { Enrollment } from "@/pages/Enrollments/types";
import type { Student } from "@/pages/Students/types";

export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE";
export type PaymentMethod =
  | "PIX"
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "";

export type Payment = {
  id?: string;
  paymentId?: string;
  enrollmentId: string;
  studentId?: string;
  planId?: number;
  amount: number;
  dueDate: string;
  paidAt?: string | null;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod | string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  enrollment?: Pick<Enrollment, "enrollmentId" | "studentId" | "planId"> & {
    student?: Pick<Student, "studentId" | "name" | "email">;
    studentName?: string;
    studentEmail?: string;
    planName?: string;
  };
  student?: Pick<Student, "studentId" | "name" | "email">;
  studentName?: string;
  studentEmail?: string;
  planName?: string;
};

export type PaymentCreateFormData = {
  enrollmentId: string;
  amount: string;
  dueDate: string;
  paymentMethod: PaymentMethod;
  notes: string;
};

export type PaymentPayFormData = {
  paidAt: string;
  paymentMethod: PaymentMethod;
  notes: string;
};


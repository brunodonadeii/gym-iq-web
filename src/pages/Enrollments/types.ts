import type { Plan } from "@/pages/Plans/types";
import type { Student } from "@/pages/Students/types";

export type EnrollmentStatus = "ACTIVE" | "SUSPENDED" | "CANCELED";

export type Enrollment = {
  enrollmentId: number;
  studentId: number;
  planId: number;
  startDate: string;
  endDate: string | null;
  status: EnrollmentStatus;
  createdAt: string;
  student?: Pick<Student, "studentId" | "name" | "email">;
  plan?: Pick<Plan, "planId" | "name" | "durationMonths" | "monthlyPrice">;
  studentName?: string;
  studentEmail?: string;
  planName?: string;
};

export type EnrollmentCreateFormData = {
  studentId: string;
  planId: string;
  startDate: string;
};

export type EnrollmentRenewFormData = {
  newPlanId: string;
};

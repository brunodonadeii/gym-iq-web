import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

export type StudentPersonalDataDeletionEligibility = {
  studentId: string;
  latestEnrollmentId: string | null;
  latestEnrollmentStatus: "ACTIVE" | "SUSPENDED" | "CANCELED" | null;
  hasActiveEnrollment: boolean;
  pendingPayments: number;
  overduePayments: number;
  hasFinancialPendingIssues: boolean;
  canAnonymize: boolean;
  blockers: string[];
};

export const studentDeletionEligibilityKeys = {
  all: ["student-deletion-eligibility"] as const,
  byStudent: (studentId: string) =>
    [...studentDeletionEligibilityKeys.all, "student", studentId] as const,
  me: () => [...studentDeletionEligibilityKeys.all, "me"] as const,
};

export async function fetchStudentPersonalDataDeletionEligibility(
  studentId: string,
) {
  const response = await authFetch(
    `students/${studentId}/personal-data/deletion-eligibility`,
  );

  return parseApiResponse<StudentPersonalDataDeletionEligibility>(
    response,
    "Erro ao verificar elegibilidade de exclusão",
  );
}

export async function fetchMyStudentPersonalDataDeletionEligibility() {
  const response = await authFetch(
    "students/me/personal-data/deletion-eligibility",
  );

  return parseApiResponse<StudentPersonalDataDeletionEligibility>(
    response,
    "Erro ao verificar elegibilidade de exclusão",
  );
}

export function useGetStudentPersonalDataDeletionEligibility(
  studentId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: studentDeletionEligibilityKeys.byStudent(studentId ?? ""),
    queryFn: () =>
      fetchStudentPersonalDataDeletionEligibility(String(studentId)),
    enabled: enabled && !!studentId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useGetMyStudentPersonalDataDeletionEligibility(enabled = true) {
  return useQuery({
    queryKey: studentDeletionEligibilityKeys.me(),
    queryFn: fetchMyStudentPersonalDataDeletionEligibility,
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

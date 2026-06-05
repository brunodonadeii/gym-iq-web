import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation } from "@tanstack/react-query";

async function deleteMyStudentPersonalData() {
  const response = await authFetch("students/me/personal-data", {
    method: "DELETE",
  });

  return parseApiResponse<Student>(response);
}

export function useDeleteMyStudentPersonalData() {
  return useMutation<Student, ApiError, void>({
    mutationFn: deleteMyStudentPersonalData,
  });
}


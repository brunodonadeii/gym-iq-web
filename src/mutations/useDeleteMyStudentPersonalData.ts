import type { Student } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation } from "@tanstack/react-query";

async function deleteMyStudentPersonalData() {
  const response = await authFetch("students/me/personal-data", {
    method: "DELETE",
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useDeleteMyStudentPersonalData() {
  return useMutation<Student, ApiError, void>({
    mutationFn: deleteMyStudentPersonalData,
  });
}


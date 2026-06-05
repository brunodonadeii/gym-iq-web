import { invalidateStudentRelatedQueries } from "@/mutations/studentQueryInvalidation";
import type { Student, StudentUpdateFormData } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateStudentData {
  id: string;
  data: StudentUpdateFormData;
}

async function updateStudent({ data, id }: UpdateStudentData) {
  const response = await authFetch(`students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseApiResponse<Student>(response);
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation<Student, ApiError, UpdateStudentData>({
    mutationFn: updateStudent,

    onSuccess: async (_, variables) => {
      await invalidateStudentRelatedQueries(queryClient, variables.id);
    },
  });
}


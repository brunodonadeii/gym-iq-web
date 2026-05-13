import type { Student, StudentEditFormData } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

interface UpdateStudentData {
  id: string;
  data: StudentEditFormData;
}

async function updateStudent({ data, id }: UpdateStudentData) {
  const response = await authFetch(`students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation<Student, ApiError, UpdateStudentData>({
    mutationFn: updateStudent,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    },
  });
}

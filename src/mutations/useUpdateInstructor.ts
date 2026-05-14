import type {
  Instructor,
  InstructorEditFormData,
} from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

interface UpdateInstructorData {
  id?: string;
  data: InstructorEditFormData;
}

async function updateInstructor({ data, id }: UpdateInstructorData) {
  const payload = {
    name: data.name,
    email: data.email,
    cref: data.cref,
    phone: data.phone,
    specialty: data.specialty.trim() || undefined,
    ...(data.password.trim() ? { password: data.password } : {}),
  };

  const response = await authFetch(`instructors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();

  return useMutation<Instructor, ApiError, UpdateInstructorData>({
    mutationFn: updateInstructor,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructors"],
      });
    },
  });
}

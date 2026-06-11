import type {
  Instructor,
  InstructorUpdateFormData,
} from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateInstructorData {
  id?: string;
  data: InstructorUpdateFormData;
}

async function updateInstructor({ data, id }: UpdateInstructorData) {
  const payload = {
    name: data.name,
    email: data.email,
    cref: data.cref,
    phone: data.phone,
    specialty: data.specialty.trim() || undefined,
  };

  const response = await authFetch(`instructors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<Instructor>(response);
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


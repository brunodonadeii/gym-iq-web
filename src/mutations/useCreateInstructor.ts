import type {
  Instructor,
  InstructorCreateFormData,
} from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createInstructor(data: InstructorCreateFormData) {
  const response = await authFetch("instructors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      specialty: data.specialty.trim() || undefined,
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();

  return useMutation<Instructor, ApiError, InstructorCreateFormData>({
    mutationFn: createInstructor,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructors"],
      });
    },
  });
}

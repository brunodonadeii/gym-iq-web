import type { QueryClient } from "@tanstack/react-query";

export async function invalidateStudentRelatedQueries(
  queryClient: QueryClient,
  studentId?: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["students"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["enrollments"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["payments"],
    }),
    ...(studentId
      ? [
          queryClient.invalidateQueries({
            queryKey: ["students", studentId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["enrollments", "student", studentId],
          }),
        ]
      : []),
  ]);
}

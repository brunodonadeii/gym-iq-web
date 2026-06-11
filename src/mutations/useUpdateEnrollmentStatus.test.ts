import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, queryClient, useMutationSpy } = vi.hoisted(
  () => ({
    authFetchSpy: vi.fn(),
    parseApiResponseSpy: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() },
    useMutationSpy: vi.fn((config) => config),
  }),
);

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationSpy,
  useQueryClient: () => queryClient,
}));

import { useUpdateEnrollmentStatus } from "./useUpdateEnrollmentStatus";

describe("useUpdateEnrollmentStatus", () => {
  it("updates enrollment status and invalidates enrollments", async () => {
    useUpdateEnrollmentStatus();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ enrollmentId: 1 });

    await mutation.mutationFn({ id: "1", newStatus: "SUSPENDED" });

    expect(authFetchSpy).toHaveBeenCalledWith(
      "enrollments/1/status?newStatus=SUSPENDED",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      },
    );
    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["enrollments"] });
  });
});

import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, queryClient, useMutationSpy } = vi.hoisted(
  () => ({
    authFetchSpy: vi.fn(),
    parseApiResponseSpy: vi.fn(),
    queryClient: {
      invalidateQueries: vi.fn(),
    },
    useMutationSpy: vi.fn((config) => config),
  }),
);

vi.mock("@/services/api", () => ({
  authFetch: authFetchSpy,
}));

vi.mock("@/utils/apiError", () => ({
  parseApiResponse: parseApiResponseSpy,
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationSpy,
  useQueryClient: () => queryClient,
}));

import { useCreateEnrollment } from "./useCreateEnrollment";

describe("useCreateEnrollment", () => {
  it("creates an enrollment converting planId to number and preserving optional startDate", async () => {
    const mutation = useCreateEnrollment();
    const variables = {
      studentId: "5",
      planId: "9",
      startDate: "2026-06-10",
    } as never;
    const response = new Response(null, { status: 200 });
    const parsed = { enrollmentId: 1 };

    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);

    await expect(mutation.mutationFn(variables)).resolves.toEqual(parsed);

    expect(authFetchSpy).toHaveBeenCalledWith("enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "5",
        planId: 9,
        startDate: "2026-06-10",
      }),
    });
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response);

    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["enrollments"],
    });
  });

  it("omits startDate when it is not provided", async () => {
    const mutation = useCreateEnrollment();
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({});

    await mutation.mutationFn({
      studentId: "5",
      planId: "9",
    } as never);

    expect(authFetchSpy).toHaveBeenCalledWith("enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "5",
        planId: 9,
      }),
    });
  });
});

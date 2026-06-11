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

import { useRenewEnrollment } from "./useRenewEnrollment";

describe("useRenewEnrollment", () => {
  it("renews the enrollment and invalidates the enrollment list on success", async () => {
    useRenewEnrollment();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      id: "12",
      newPlanId: "3",
    };
    const response = new Response(null, { status: 200 });
    const parsed = { enrollmentId: 12 };

    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);

    await expect(mutation.mutationFn(variables)).resolves.toEqual(parsed);

    expect(authFetchSpy).toHaveBeenCalledWith(
      "enrollments/12/renew?newPlanId=3",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response);

    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["enrollments"],
    });
  });
});

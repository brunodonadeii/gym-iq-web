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

import { useCreatePlan } from "./useCreatePlan";

describe("useCreatePlan", () => {
  it("creates a plan and invalidates plans on success", async () => {
    useCreatePlan();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      data: {
        name: "Premium",
        description: "Plano completo",
        monthlyPrice: 99.9,
        durationMonths: 12,
      },
    };
    const response = new Response(null, { status: 200 });
    const parsed = { planId: 1 };

    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);

    await expect(mutation.mutationFn(variables)).resolves.toEqual(parsed);

    expect(authFetchSpy).toHaveBeenCalledWith("plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variables.data),
    });
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response);

    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["plans"],
    });
  });
});

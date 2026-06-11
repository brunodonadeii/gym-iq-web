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

import { useUpdatePlan } from "./useUpdatePlan";

describe("useUpdatePlan", () => {
  it("updates a plan and invalidates plans on success", async () => {
    useUpdatePlan();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      id: "7",
      data: {
        name: "Premium",
        description: "Atualizado",
        monthlyPrice: 109.9,
        durationMonths: 12,
      },
    };
    const response = new Response(null, { status: 200 });
    const parsed = { planId: 7 };

    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);

    await expect(mutation.mutationFn(variables)).resolves.toEqual(parsed);

    expect(authFetchSpy).toHaveBeenCalledWith("plans/7", {
      method: "PUT",
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

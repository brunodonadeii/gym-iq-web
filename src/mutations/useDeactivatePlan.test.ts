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

import { useDeactivatePlan } from "./useDeactivatePlan";

describe("useDeactivatePlan", () => {
  it("deactivates a plan and invalidates plans", async () => {
    useDeactivatePlan();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({});

    await mutation.mutationFn({ id: "3" });
    mutation.onSuccess();

    expect(authFetchSpy).toHaveBeenCalledWith("plans/3/deactivate", { method: "PATCH" });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["plans"] });
  });
});

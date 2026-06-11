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

import { useDeleteWorkoutSheet } from "./useDeleteWorkoutSheet";

describe("useDeleteWorkoutSheet", () => {
  it("deletes a workout sheet and invalidates workout sheets", async () => {
    useDeleteWorkoutSheet();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({});

    await mutation.mutationFn({ id: "8" });
    mutation.onSuccess();

    expect(authFetchSpy).toHaveBeenCalledWith("workout-sheets/8", { method: "DELETE" });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["workout-sheets"],
    });
  });
});

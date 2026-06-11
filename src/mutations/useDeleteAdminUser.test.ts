import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiVoidResponseSpy, queryClient, useMutationSpy } = vi.hoisted(
  () => ({
    authFetchSpy: vi.fn(),
    parseApiVoidResponseSpy: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() },
    useMutationSpy: vi.fn((config) => config),
  }),
);

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiVoidResponse: parseApiVoidResponseSpy }));
vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationSpy,
  useQueryClient: () => queryClient,
}));

import { useDeleteAdminUser } from "./useDeleteAdminUser";

describe("useDeleteAdminUser", () => {
  it("deletes an admin user and invalidates users", async () => {
    useDeleteAdminUser();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    authFetchSpy.mockResolvedValue(new Response(null, { status: 204 }));
    parseApiVoidResponseSpy.mockResolvedValue(undefined);

    await mutation.mutationFn({ id: "7" });

    expect(authFetchSpy).toHaveBeenCalledWith("users/7", { method: "DELETE" });
    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["users"] });
  });
});

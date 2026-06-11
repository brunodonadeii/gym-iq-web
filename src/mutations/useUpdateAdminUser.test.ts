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

import { useUpdateAdminUser } from "./useUpdateAdminUser";

describe("useUpdateAdminUser", () => {
  it("updates an admin user and invalidates list and detail queries", async () => {
    useUpdateAdminUser();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      id: "7",
      data: {
        name: "Admin",
        email: "admin@test.com",
        role: "RECEPTION",
      },
    };
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ userId: 7 });

    await mutation.mutationFn(variables);

    expect(authFetchSpy).toHaveBeenCalledWith("users/7", {
      method: "PUT",
      body: JSON.stringify({
        name: "Admin",
        email: "admin@test.com",
        role: "RECEPTION",
      }),
    });
    mutation.onSuccess(undefined, variables);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["users"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["users", "7"] });
  });
});

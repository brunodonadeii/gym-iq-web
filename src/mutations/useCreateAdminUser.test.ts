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

import { useCreateAdminUser } from "./useCreateAdminUser";

describe("useCreateAdminUser", () => {
  it("creates an admin user and invalidates users", async () => {
    useCreateAdminUser();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      name: "Admin",
      email: "admin@test.com",
      password: "123456",
      role: "ADMIN",
    };
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ userId: 1 });

    await mutation.mutationFn(variables);

    expect(authFetchSpy).toHaveBeenCalledWith("users", {
      method: "POST",
      body: JSON.stringify(variables),
    });
    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["users"] });
  });
});

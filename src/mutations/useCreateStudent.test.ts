import { describe, expect, it, vi } from "vitest";

const {
  authFetchSpy,
  parseApiResponseSpy,
  queryClient,
  useMutationSpy,
} = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  useMutationSpy: vi.fn((config) => config),
}));

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

import { useCreateStudent } from "./useCreateStudent";

describe("useCreateStudent", () => {
  it("creates the mutation with the expected request and invalidates students on success", async () => {
    useCreateStudent();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const payload = {
      name: "Marina",
      email: "marina@test.com",
    };
    const response = new Response(null, { status: 200 });
    const parsed = { id: "1", name: "Marina" };

    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);

    await expect(mutation.mutationFn(payload)).resolves.toEqual(parsed);

    expect(authFetchSpy).toHaveBeenCalledWith("students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response);

    mutation.onSuccess();

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["students"],
    });
  });
});

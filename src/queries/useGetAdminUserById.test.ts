import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, useQuerySpy } = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
}));

vi.mock("@/services/api", () => ({
  authFetch: authFetchSpy,
}));

vi.mock("@/utils/apiError", () => ({
  parseApiResponse: parseApiResponseSpy,
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQuerySpy,
}));

import { useGetAdminUserById } from "./useGetAdminUserById";

describe("useGetAdminUserById", () => {
  it("fetches an admin user by id", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ userId: 1 });

    useGetAdminUserById("1");
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["users", "1"]);
    expect(query.enabled).toBe(true);
    expect(query.staleTime).toBe(5 * 60 * 1000);
    expect(query.gcTime).toBe(15 * 60 * 1000);
    expect(authFetchSpy).toHaveBeenCalledWith("users/1");
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      response,
      "Erro ao buscar usuário administrativo",
    );
  });
});

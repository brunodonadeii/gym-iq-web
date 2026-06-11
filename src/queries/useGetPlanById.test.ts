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

import { useGetPlanById } from "./useGetPlanById";

describe("useGetPlanById", () => {
  it("fetches a plan by id", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ planId: 1 });

    useGetPlanById("1");
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["plans", "1"]);
    expect(query.enabled).toBe(true);
    expect(authFetchSpy).toHaveBeenCalledWith("plans/1");
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response, "Erro ao buscar plano");
  });
});

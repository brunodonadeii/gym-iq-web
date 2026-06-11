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

import { useGetInstructorById } from "./useGetInstructorById";

describe("useGetInstructorById", () => {
  it("fetches an instructor by id", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ instructorId: 1 });

    useGetInstructorById("1");
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["instructors", "1"]);
    expect(query.enabled).toBe(true);
    expect(authFetchSpy).toHaveBeenCalledWith("instructors/1");
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response, "Erro ao buscar instrutor");
  });
});

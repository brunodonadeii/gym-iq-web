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

import { useGetStudentById } from "./useGetStudentById";

describe("useGetStudentById", () => {
  it("builds the query config for a valid student id", async () => {
    const query = useGetStudentById("42");
    const response = new Response(null, { status: 200 });
    const parsed = { studentId: "42" };
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);

    await expect(query.queryFn()).resolves.toEqual(parsed);

    expect(query.queryKey).toEqual(["students", "42"]);
    expect(query.enabled).toBe(true);
    expect(query.staleTime).toBe(5 * 60 * 1000);
    expect(query.gcTime).toBe(15 * 60 * 1000);
    expect(query.refetchOnWindowFocus).toBe(false);
    expect(authFetchSpy).toHaveBeenCalledWith("students/42");
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      response,
      "Erro ao buscar alunos",
    );
  });

  it("disables the query when the id is empty", () => {
    const query = useGetStudentById("");

    expect(query.enabled).toBe(false);
    expect(query.queryKey).toEqual(["students", ""]);
  });
});

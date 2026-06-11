import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, useQuerySpy } = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
}));

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({ useQuery: useQuerySpy }));

import { useGetStudentMe } from "./useGetStudentMe";

describe("useGetStudentMe", () => {
  it("fetches the authenticated student", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ studentId: 1 });

    useGetStudentMe();
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["students", "me"]);
    expect(query.staleTime).toBe(5 * 60 * 1000);
    expect(authFetchSpy).toHaveBeenCalledWith("students/me");
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response, "Erro ao buscar dados do aluno");
  });
});

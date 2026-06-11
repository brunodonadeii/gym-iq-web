import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, useQuerySpy } = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
}));

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({ useQuery: useQuerySpy }));

import { useGetActiveStudentEnrollment } from "./useGetActiveStudentEnrollment";

describe("useGetActiveStudentEnrollment", () => {
  it("returns null for 404 active enrollment responses", async () => {
    authFetchSpy.mockResolvedValue(new Response(null, { status: 404 }));

    useGetActiveStudentEnrollment("7", true);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await expect(query.queryFn()).resolves.toBeNull();

    expect(query.queryKey).toEqual(["enrollments", "student", "7", "active"]);
    expect(query.enabled).toBe(true);
  });

  it("parses active enrollment when it exists", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ enrollmentId: 1 });

    useGetActiveStudentEnrollment("7", true);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      response,
      "Erro ao buscar matrícula ativa do aluno",
    );
  });
});

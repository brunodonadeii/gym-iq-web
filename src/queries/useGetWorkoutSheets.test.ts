import { describe, expect, it, vi } from "vitest";

const {
  authFetchSpy,
  buildPaginationParamsSpy,
  parseApiResponseSpy,
  useQuerySpy,
  keepPreviousDataMock,
} = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  buildPaginationParamsSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
  keepPreviousDataMock: Symbol("keepPreviousData"),
}));

vi.mock("@/services/api", () => ({
  authFetch: authFetchSpy,
}));

vi.mock("@/utils/apiError", () => ({
  parseApiResponse: parseApiResponseSpy,
}));

vi.mock("@/utils/pagination", () => ({
  buildPaginationParams: buildPaginationParamsSpy,
}));

vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: keepPreviousDataMock,
  useQuery: useQuerySpy,
}));

import { fetchWorkoutSheets, useGetWorkoutSheets } from "./useGetWorkoutSheets";

describe("useGetWorkoutSheets", () => {
  it("fetches all workout sheets with default sorting", async () => {
    const response = new Response(null, { status: 200 });
    const parsed = { content: [] };
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&sort=createdAt%2Cdesc");
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);

    await expect(
      fetchWorkoutSheets({ mode: "all" }, { page: 0, size: 10 }),
    ).resolves.toEqual(parsed);

    expect(buildPaginationParamsSpy).toHaveBeenCalledWith(
      { sort: "createdAt,desc", page: 0, size: 10 },
      undefined,
    );
    expect(authFetchSpy).toHaveBeenCalledWith(
      "workout-sheets?page=0&size=10&sort=createdAt%2Cdesc",
    );
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      response,
      "Erro ao buscar fichas de treino",
    );
  });

  it("uses the student endpoint and includes onlyActive when provided", async () => {
    buildPaginationParamsSpy.mockReturnValue(
      "page=0&size=10&sort=createdAt%2Cdesc&onlyActive=true",
    );
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    await fetchWorkoutSheets(
      { mode: "student", studentId: "9", onlyActive: true },
      { page: 0, size: 10 },
    );

    expect(authFetchSpy).toHaveBeenCalledWith(
      "workout-sheets/student/9?page=0&size=10&sort=createdAt%2Cdesc&onlyActive=true",
    );
  });

  it("uses the instructor endpoint when filtering by instructor", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=1&size=5&sort=createdAt%2Cdesc");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    await fetchWorkoutSheets(
      { mode: "instructor", instructorId: "3" },
      { page: 1, size: 5 },
    );

    expect(authFetchSpy).toHaveBeenCalledWith(
      "workout-sheets/instructor/3?page=1&size=5&sort=createdAt%2Cdesc",
    );
  });

  it("builds the query with placeholder data and enabled flag", () => {
    const queryConfig = { mode: "all" } as const;
    const pagination = { page: 2, size: 20 };
    useGetWorkoutSheets(queryConfig, false, pagination);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, unknown>;

    expect(query.queryKey).toEqual(["workout-sheets", queryConfig, pagination]);
    expect(query.enabled).toBe(false);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
    expect(query.refetchOnWindowFocus).toBe(false);
  });
});

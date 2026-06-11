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

import {
  fetchStudents,
  STUDENTS_QUERY_GC_TIME,
  STUDENTS_QUERY_STALE_TIME,
  useGetStudents,
} from "./useGetStudents";

describe("useGetStudents", () => {
  it("fetches the default student list when there is no search term", async () => {
    const response = new Response(null, { status: 200 });
    const parsed = { content: [] };
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&status=ALL");
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);

    await expect(
      fetchStudents("", "ALL", { page: 0, size: 10, sort: "user.name,asc" }),
    ).resolves.toEqual(parsed);

    expect(buildPaginationParamsSpy).toHaveBeenCalledWith(
      { page: 0, size: 10, sort: "user.name,asc" },
      { status: "ALL" },
    );
    expect(authFetchSpy).toHaveBeenCalledWith("students?page=0&size=10&status=ALL");
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      response,
      "Erro ao buscar alunos",
    );
  });

  it("uses the search endpoint when a search term is provided", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=1&size=10&q=ana&status=ACTIVE");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    await fetchStudents("ana", "ACTIVE", { page: 1, size: 10 });

    expect(authFetchSpy).toHaveBeenCalledWith(
      "students/search?page=1&size=10&q=ana&status=ACTIVE",
    );
  });

  it("builds the query with placeholder data and cache timings", () => {
    const pagination = { page: 2, size: 20 };
    const query = useGetStudents("mar", "INACTIVE", pagination);

    expect(query.queryKey).toEqual(["students", "mar", "INACTIVE", pagination]);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
    expect(query.staleTime).toBe(STUDENTS_QUERY_STALE_TIME);
    expect(query.gcTime).toBe(STUDENTS_QUERY_GC_TIME);
    expect(query.refetchOnWindowFocus).toBe(false);
  });
});

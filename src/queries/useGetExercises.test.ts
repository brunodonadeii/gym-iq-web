import { describe, expect, it, vi } from "vitest";

const {
  authFetchSpy,
  buildPaginationParamsSpy,
  keepPreviousDataMock,
  parseApiResponseSpy,
  useQuerySpy,
} = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  buildPaginationParamsSpy: vi.fn(),
  keepPreviousDataMock: Symbol("keepPreviousData"),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
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

import { fetchExercises, useGetExercises } from "./useGetExercises";

describe("useGetExercises", () => {
  it("uses search endpoint when a search term exists", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&q=agacho");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    await fetchExercises("active", "agacho", { page: 0, size: 10 });

    expect(authFetchSpy).toHaveBeenCalledWith("exercises/search?page=0&size=10&q=agacho");
  });

  it("uses active and all endpoints correctly", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    await fetchExercises("active", "", { page: 0, size: 10 });
    expect(authFetchSpy).toHaveBeenCalledWith("exercises?page=0&size=10");

    await fetchExercises("all", "", { page: 0, size: 10 });
    expect(authFetchSpy).toHaveBeenCalledWith("exercises/all?page=0&size=10");
  });

  it("configures query metadata", () => {
    const pagination = { page: 0, size: 10, sort: "name,asc" };
    useGetExercises("active", "", pagination, false);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, unknown>;

    expect(query.queryKey).toEqual(["exercises", "active", "", pagination]);
    expect(query.enabled).toBe(false);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
  });
});

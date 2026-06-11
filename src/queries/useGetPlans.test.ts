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

import { useGetPlans } from "./useGetPlans";

describe("useGetPlans", () => {
  it("configures the plans list query with status and trimmed search", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&status=ACTIVE&q=abc");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    const pagination = { page: 0, size: 10, sort: "name,asc" };
    useGetPlans("active", " abc ", pagination, true);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;

    await query.queryFn();

    expect(query.queryKey).toEqual(["plans", "active", " abc ", pagination]);
    expect(query.enabled).toBe(true);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
    expect(buildPaginationParamsSpy).toHaveBeenCalledWith(pagination, {
      status: "ACTIVE",
      q: "abc",
    });
    expect(authFetchSpy).toHaveBeenCalledWith("plans?page=0&size=10&status=ACTIVE&q=abc");
  });

  it("maps inactive and all modes correctly", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&status=INACTIVE");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    useGetPlans("inactive", "", { page: 0, size: 10, sort: "name,asc" });
    let query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();
    expect(buildPaginationParamsSpy).toHaveBeenCalledWith(
      { page: 0, size: 10, sort: "name,asc" },
      { status: "INACTIVE" },
    );

    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&status=ALL");
    useGetPlans("all", "", { page: 0, size: 10, sort: "name,asc" });
    query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();
    expect(buildPaginationParamsSpy).toHaveBeenCalledWith(
      { page: 0, size: 10, sort: "name,asc" },
      { status: "ALL" },
    );
  });
});

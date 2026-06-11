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

import { useGetAdminUsers } from "./useGetAdminUsers";

describe("useGetAdminUsers", () => {
  it("trims the search term and configures the query", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&q=admin&role=ALL");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    const pagination = { page: 0, size: 10 };
    useGetAdminUsers(" admin ", "ALL", pagination);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;

    await query.queryFn();

    expect(query.queryKey).toEqual(["users", " admin ", "ALL", pagination]);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
    expect(buildPaginationParamsSpy).toHaveBeenCalledWith(pagination, {
      q: "admin",
      role: "ALL",
    });
    expect(authFetchSpy).toHaveBeenCalledWith("users?page=0&size=10&q=admin&role=ALL");
  });
});

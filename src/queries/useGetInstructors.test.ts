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

import { useGetInstructors } from "./useGetInstructors";

describe("useGetInstructors", () => {
  it("uses search endpoint when search term is present", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&q=mar&status=ACTIVE");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    const pagination = { page: 0, size: 10, sort: "user.name,asc" };
    useGetInstructors("mar", "ACTIVE", pagination, true);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;

    await query.queryFn();

    expect(query.queryKey).toEqual([
      "instructors",
      { page: 0, size: 10, search: "mar", status: "ACTIVE" },
    ]);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "instructors/search?page=0&size=10&q=mar&status=ACTIVE",
    );
  });

  it("uses default endpoint without search", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&status=ALL");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    useGetInstructors("", "ALL", { page: 0, size: 10, sort: "user.name,asc" });
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();
    expect(authFetchSpy).toHaveBeenCalledWith("instructors?page=0&size=10&status=ALL");
  });
});

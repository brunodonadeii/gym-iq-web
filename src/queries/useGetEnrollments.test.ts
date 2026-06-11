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

import { useGetEnrollments } from "./useGetEnrollments";

describe("useGetEnrollments", () => {
  it("fetches enrollments with status filter and cache settings", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&sort=createdAt%2Cdesc&status=ACTIVE");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    const pagination = { page: 0, size: 10, sort: "createdAt,desc" };
    useGetEnrollments("ACTIVE", pagination);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;

    await query.queryFn();

    expect(query.queryKey).toEqual(["enrollments", "ACTIVE", pagination]);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "enrollments?page=0&size=10&sort=createdAt%2Cdesc&status=ACTIVE",
    );
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      expect.any(Response),
      "Erro ao buscar matrículas",
    );
  });
});

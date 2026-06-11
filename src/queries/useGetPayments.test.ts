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

import { useGetPayments } from "./useGetPayments";

describe("useGetPayments", () => {
  it("fetches all payments with default sorting", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&sort=dueDate%2Cdesc");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    const queryVars = { mode: "all" } as const;
    const pagination = { page: 0, size: 10 };
    useGetPayments(queryVars, true, pagination);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;

    await query.queryFn();

    expect(query.queryKey).toEqual(["payments", queryVars, pagination]);
    expect(query.enabled).toBe(true);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
    expect(buildPaginationParamsSpy).toHaveBeenCalledWith(
      { page: 0, size: 10, sort: "dueDate,desc" },
      { status: undefined },
    );
    expect(authFetchSpy).toHaveBeenCalledWith(
      "payments?page=0&size=10&sort=dueDate%2Cdesc",
    );
  });

  it("uses student and enrollment endpoints with status filter", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=1&size=5&sort=dueDate%2Cdesc&status=PAID");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    useGetPayments(
      { mode: "student", studentId: "7", status: "PAID" } as never,
      true,
      { page: 1, size: 5 },
    );
    let query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();
    expect(authFetchSpy).toHaveBeenCalledWith(
      "payments/student/7?page=1&size=5&sort=dueDate%2Cdesc&status=PAID",
    );

    useGetPayments(
      { mode: "enrollment", enrollmentId: "3", status: "PAID" } as never,
      true,
      { page: 1, size: 5 },
    );
    query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();
    expect(authFetchSpy).toHaveBeenCalledWith(
      "payments/enrollment/3?page=1&size=5&sort=dueDate%2Cdesc&status=PAID",
    );
  });
});

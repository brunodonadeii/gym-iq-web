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

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@/utils/pagination", () => ({ buildPaginationParams: buildPaginationParamsSpy }));
vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: keepPreviousDataMock,
  useQuery: useQuerySpy,
}));

import { useGetStudentEnrollments } from "./useGetStudentEnrollments";

describe("useGetStudentEnrollments", () => {
  it("fetches enrollments for a student", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&sort=createdAt%2Cdesc&status=ACTIVE");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    const pagination = { page: 0, size: 10, sort: "createdAt,desc" };
    useGetStudentEnrollments("7", "ACTIVE", true, pagination);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["enrollments", "student", "7", "ACTIVE", pagination]);
    expect(query.enabled).toBe(true);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "enrollments/student/7?page=0&size=10&sort=createdAt%2Cdesc&status=ACTIVE",
    );
  });
});

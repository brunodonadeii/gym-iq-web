import { describe, expect, it, vi } from "vitest";

const {
  authFetchSpy,
  buildPaginationParamsSpy,
  parseApiResponseSpy,
  useInfiniteQuerySpy,
} = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  buildPaginationParamsSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useInfiniteQuerySpy: vi.fn((config) => ({ ...config, data: undefined })),
}));

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@/utils/pagination", () => ({ buildPaginationParams: buildPaginationParamsSpy }));
vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: useInfiniteQuerySpy,
}));

import { useGetMyEnrollments } from "./useGetMyEnrollments";

describe("useGetMyEnrollments", () => {
  it("fetches paginated enrollments for the authenticated student", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=5&sort=createdAt%2Cdesc");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [], last: true, number: 0 });

    useGetMyEnrollments();
    const query = useInfiniteQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn({ pageParam: 0 });

    expect(query.queryKey).toEqual(["enrollments", "me"]);
    expect(query.initialPageParam).toBe(0);
    expect(query.staleTime).toBe(2 * 60 * 1000);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "enrollments/me?page=0&size=5&sort=createdAt%2Cdesc",
    );
  });

  it("flattens accumulated pages into a single enrollment list", () => {
    useInfiniteQuerySpy.mockImplementationOnce((config) => ({
      ...config,
      data: {
        pages: [
          { content: [{ enrollmentId: 1 }] },
          { content: [{ enrollmentId: 2 }] },
        ],
      },
    }));

    const query = useGetMyEnrollments() as Record<string, any>;
    expect(query.data).toEqual([{ enrollmentId: 1 }, { enrollmentId: 2 }]);
    expect(query.getNextPageParam({ last: false, number: 1 })).toBe(2);
  });
});

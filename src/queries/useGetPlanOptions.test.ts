import { describe, expect, it, vi } from "vitest";

const {
  authFetchSpy,
  parseApiResponseSpy,
  useInfiniteQuerySpy,
} = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useInfiniteQuerySpy: vi.fn((config) => ({ ...config, data: undefined })),
}));

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: useInfiniteQuerySpy,
}));

import { useGetPlanOptions } from "./useGetPlanOptions";

describe("useGetPlanOptions", () => {
  it("configures the infinite query and trims the search term", async () => {
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [], last: true, number: 0 });

    useGetPlanOptions(" premium ", false);
    const query = useInfiniteQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn({ pageParam: 1 });

    expect(query.queryKey).toEqual(["plans", "options", " premium "]);
    expect(query.enabled).toBe(false);
    expect(query.initialPageParam).toBe(0);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "plans?page=1&size=20&status=ACTIVE&q=premium",
    );
  });

  it("deduplicates plans from accumulated pages and computes next page", () => {
    useInfiniteQuerySpy.mockImplementationOnce((config) => ({
      ...config,
      data: {
        pages: [
          { content: [{ planId: 1, name: "A" }, { planId: 2, name: "B" }] },
          { content: [{ planId: 2, name: "B" }, { planId: 3, name: "C" }] },
        ],
      },
    }));

    const query = useGetPlanOptions() as Record<string, any>;

    expect(query.data).toEqual([
      { planId: 1, name: "A" },
      { planId: 2, name: "B" },
      { planId: 3, name: "C" },
    ]);
    expect(query.getNextPageParam({ last: false, number: 1 })).toBe(2);
    expect(query.getNextPageParam({ last: true, number: 1 })).toBeUndefined();
  });
});

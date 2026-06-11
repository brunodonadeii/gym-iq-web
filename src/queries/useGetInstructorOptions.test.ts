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

import { useGetInstructorOptions } from "./useGetInstructorOptions";

describe("useGetInstructorOptions", () => {
  it("configures the infinite query and trims the search term", async () => {
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [], last: true, number: 0 });

    useGetInstructorOptions(" marina ", false);
    const query = useInfiniteQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn({ pageParam: 1 });

    expect(query.queryKey).toEqual(["instructors", "options", " marina "]);
    expect(query.enabled).toBe(false);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "instructors/search?page=1&size=20&status=ACTIVE&q=marina",
    );
  });

  it("deduplicates instructors and calculates the next page", () => {
    useInfiniteQuerySpy.mockImplementationOnce((config) => ({
      ...config,
      data: {
        pages: [
          { content: [{ instructorId: "1", name: "Ana" }] },
          { content: [{ instructorId: "1", name: "Ana" }, { instructorId: "2", name: "Bia" }] },
        ],
      },
    }));

    const query = useGetInstructorOptions() as Record<string, any>;

    expect(query.data).toEqual([
      { instructorId: "1", name: "Ana" },
      { instructorId: "2", name: "Bia" },
    ]);
    expect(query.getNextPageParam({ last: false, number: 1 })).toBe(2);
    expect(query.getNextPageParam({ last: true, number: 1 })).toBeUndefined();
  });
});

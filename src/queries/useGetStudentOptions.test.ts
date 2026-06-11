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

import { useGetStudentOptions } from "./useGetStudentOptions";

describe("useGetStudentOptions", () => {
  it("fetches options with search and normalizes array responses", async () => {
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue([{ studentId: "1", name: "Ana" }]);

    useGetStudentOptions("ana", true);
    const query = useInfiniteQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const result = await query.queryFn({ pageParam: 0 });

    expect(authFetchSpy).toHaveBeenCalledWith("students/options?page=0&size=20&q=ana");
    expect(result).toMatchObject({
      content: [{ studentId: "1", name: "Ana" }],
      number: 0,
      size: 20,
      first: true,
      last: true,
    });
  });

  it("deduplicates merged students and stops when no new student is introduced", () => {
    useInfiniteQuerySpy.mockImplementationOnce((config) => ({
      ...config,
      data: {
        pages: [
          { content: [{ studentId: "1", name: "Ana" }] },
          { content: [{ studentId: "1", name: "Ana" }, { studentId: "2", name: "Bia" }] },
        ],
      },
    }));

    const query = useGetStudentOptions() as Record<string, any>;

    expect(query.data).toEqual([
      { studentId: "1", name: "Ana" },
      { studentId: "2", name: "Bia" },
    ]);
    expect(
      query.getNextPageParam(
        {
          last: false,
          number: 1,
          content: [{ studentId: "2", name: "Bia" }],
        },
        [
          { content: [{ studentId: "1", name: "Ana" }] },
          { content: [{ studentId: "2", name: "Bia" }] },
        ],
      ),
    ).toBe(2);
    expect(
      query.getNextPageParam(
        {
          last: false,
          number: 1,
          content: [{ studentId: "1", name: "Ana" }],
        },
        [
          { content: [{ studentId: "1", name: "Ana" }] },
          { content: [{ studentId: "1", name: "Ana" }] },
        ],
      ),
    ).toBeUndefined();
  });
});

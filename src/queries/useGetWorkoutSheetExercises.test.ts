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

import { useGetWorkoutSheetExercises } from "./useGetWorkoutSheetExercises";

describe("useGetWorkoutSheetExercises", () => {
  it("fetches workout sheet exercises with default sort", async () => {
    buildPaginationParamsSpy.mockReturnValue("page=0&size=10&sort=executionOrder%2Casc");
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ content: [] });

    const pagination = { page: 0, size: 10 };
    useGetWorkoutSheetExercises("3", pagination, true);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["workout-sheets", "3", "exercises", pagination]);
    expect(query.enabled).toBe(true);
    expect(query.placeholderData).toBe(keepPreviousDataMock);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "workout-sheets/3/exercises?page=0&size=10&sort=executionOrder%2Casc",
    );
  });
});

import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, useQuerySpy } = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
}));

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({ useQuery: useQuerySpy }));

import { useGetWorkoutSheetById } from "./useGetWorkoutSheetById";

describe("useGetWorkoutSheetById", () => {
  it("fetches a workout sheet by id", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ workoutSheetId: 1 });

    useGetWorkoutSheetById("1");
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["workout-sheets", "1"]);
    expect(query.enabled).toBe(true);
    expect(query.staleTime).toBe(5 * 60 * 1000);
    expect(authFetchSpy).toHaveBeenCalledWith("workout-sheets/1");
  });
});

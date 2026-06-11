import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, useQuerySpy } = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
}));

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({ useQuery: useQuerySpy }));

import { useGetMyInstructor } from "./useGetMyInstructor";

describe("useGetMyInstructor", () => {
  it("fetches the authenticated instructor", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ instructorId: 1 });

    useGetMyInstructor(false);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["instructors", "me"]);
    expect(query.enabled).toBe(false);
    expect(query.staleTime).toBe(5 * 60 * 1000);
    expect(query.gcTime).toBe(15 * 60 * 1000);
    expect(authFetchSpy).toHaveBeenCalledWith("instructors/me");
  });
});

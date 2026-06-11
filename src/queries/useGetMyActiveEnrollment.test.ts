import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, useQuerySpy } = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
}));

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({ useQuery: useQuerySpy }));

import { useGetMyActiveEnrollment } from "./useGetMyActiveEnrollment";

describe("useGetMyActiveEnrollment", () => {
  it("returns null for 404 responses", async () => {
    authFetchSpy.mockResolvedValue(new Response(null, { status: 404 }));

    useGetMyActiveEnrollment();
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await expect(query.queryFn()).resolves.toBeNull();

    expect(query.queryKey).toEqual(["enrollments", "me", "active"]);
    expect(query.staleTime).toBe(2 * 60 * 1000);
  });
});

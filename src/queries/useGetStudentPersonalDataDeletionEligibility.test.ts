import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, useQuerySpy } = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
}));

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({ useQuery: useQuerySpy }));

import {
  studentDeletionEligibilityKeys,
  useGetMyStudentPersonalDataDeletionEligibility,
  useGetStudentPersonalDataDeletionEligibility,
} from "./useGetStudentPersonalDataDeletionEligibility";

describe("useGetStudentPersonalDataDeletionEligibility", () => {
  it("builds the expected keys", () => {
    expect(studentDeletionEligibilityKeys.all).toEqual(["student-deletion-eligibility"]);
    expect(studentDeletionEligibilityKeys.byStudent("7")).toEqual([
      "student-deletion-eligibility",
      "student",
      "7",
    ]);
    expect(studentDeletionEligibilityKeys.me()).toEqual([
      "student-deletion-eligibility",
      "me",
    ]);
  });

  it("fetches deletion eligibility for a specific student", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ canAnonymize: true });

    useGetStudentPersonalDataDeletionEligibility("7", false);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual([
      "student-deletion-eligibility",
      "student",
      "7",
    ]);
    expect(query.enabled).toBe(false);
    expect(query.staleTime).toBe(30 * 1000);
    expect(query.gcTime).toBe(5 * 60 * 1000);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "students/7/personal-data/deletion-eligibility",
    );
  });

  it("fetches deletion eligibility for the authenticated student", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ canAnonymize: true });

    useGetMyStudentPersonalDataDeletionEligibility(true);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["student-deletion-eligibility", "me"]);
    expect(query.enabled).toBe(true);
    expect(authFetchSpy).toHaveBeenCalledWith(
      "students/me/personal-data/deletion-eligibility",
    );
  });
});

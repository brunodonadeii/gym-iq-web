import { describe, expect, it, vi } from "vitest";

const {
  authFetchSpy,
  invalidateStudentRelatedQueriesSpy,
  parseApiResponseSpy,
  queryClient,
  useMutationSpy,
} = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  invalidateStudentRelatedQueriesSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  queryClient: {},
  useMutationSpy: vi.fn((config) => config),
}));

vi.mock("@/mutations/studentQueryInvalidation", () => ({
  invalidateStudentRelatedQueries: invalidateStudentRelatedQueriesSpy,
}));
vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationSpy,
  useQueryClient: () => queryClient,
}));

import { useActivateStudent } from "./useActivateStudent";

describe("useActivateStudent", () => {
  it("activates a student and invalidates student-related queries", async () => {
    useActivateStudent();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({});
    invalidateStudentRelatedQueriesSpy.mockResolvedValue(undefined);

    await mutation.mutationFn({ id: "9" });
    await mutation.onSuccess(undefined, { id: "9" });

    expect(authFetchSpy).toHaveBeenCalledWith("students/9/active", { method: "PATCH" });
    expect(invalidateStudentRelatedQueriesSpy).toHaveBeenCalledWith(queryClient, "9");
  });
});

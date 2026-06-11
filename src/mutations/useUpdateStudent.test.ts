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

vi.mock("@/services/api", () => ({
  authFetch: authFetchSpy,
}));

vi.mock("@/utils/apiError", () => ({
  parseApiResponse: parseApiResponseSpy,
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationSpy,
  useQueryClient: () => queryClient,
}));

import { useUpdateStudent } from "./useUpdateStudent";

describe("useUpdateStudent", () => {
  it("updates the student and invalidates related queries on success", async () => {
    const mutation = useUpdateStudent();
    const variables = {
      id: "42",
      data: {
        name: "Marina",
      },
    } as never;
    const response = new Response(null, { status: 200 });
    const parsed = { id: "42", name: "Marina" };

    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(parsed);
    invalidateStudentRelatedQueriesSpy.mockResolvedValue(undefined);

    await expect(mutation.mutationFn(variables)).resolves.toEqual(parsed);

    expect(authFetchSpy).toHaveBeenCalledWith("students/42", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables.data),
    });
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response);

    await mutation.onSuccess(parsed, variables);

    expect(invalidateStudentRelatedQueriesSpy).toHaveBeenCalledWith(
      queryClient,
      "42",
    );
  });
});

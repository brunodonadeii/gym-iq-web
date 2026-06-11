import { describe, expect, it } from "vitest";

import { buildPaginationParams, DEFAULT_PAGE_SIZE } from "./pagination";

describe("pagination utils", () => {
  it("uses default page and size values when pagination fields are omitted", () => {
    expect(buildPaginationParams({})).toBe(
      `page=0&size=${DEFAULT_PAGE_SIZE}`,
    );
  });

  it("includes page, size and sort when they are provided", () => {
    expect(
      buildPaginationParams({
        page: 2,
        size: 25,
        sort: "createdAt,desc",
      }),
    ).toBe("page=2&size=25&sort=createdAt%2Cdesc");
  });

  it("adds extra params and skips undefined or empty string values", () => {
    expect(
      buildPaginationParams(
        {
          page: 1,
          size: 10,
        },
        {
          search: "bruno",
          active: true,
          category: "",
          instructorId: undefined,
          total: 3,
        },
      ),
    ).toBe("page=1&size=10&search=bruno&active=true&total=3");
  });
});

import { describe, expect, it } from "vitest";
import { toAuditLogDateTime } from "./useGetAuditLogs";

describe("toAuditLogDateTime", () => {
  it("converts the initial date to the start of the local day", () => {
    expect(toAuditLogDateTime("2026-06-10", "start")).toBe(
      "2026-06-10T00:00:00",
    );
  });

  it("converts the final date to the end of the local day", () => {
    expect(toAuditLogDateTime("2026-06-10", "end")).toBe(
      "2026-06-10T23:59:59.999999999",
    );
  });

  it("omits empty date filters", () => {
    expect(toAuditLogDateTime("", "start")).toBeUndefined();
    expect(toAuditLogDateTime("   ", "end")).toBeUndefined();
  });
});

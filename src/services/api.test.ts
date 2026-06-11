import { describe, expect, it } from "vitest";
import { buildLoginRedirectUrl } from "./api";

describe("buildLoginRedirectUrl", () => {
  it("preserves the current route when the session expires", () => {
    expect(
      buildLoginRedirectUrl("session-expired", "/payments?status=PENDING"),
    ).toBe(
      "/login?redirect=%2Fpayments%3Fstatus%3DPENDING&reason=session-expired",
    );
  });

  it("uses the role default route after permissions change", () => {
    expect(
      buildLoginRedirectUrl("permissions-changed", "/audit-logs"),
    ).toBe(
      "/login?redirect=%2Fdashboard&reason=permissions-changed",
    );
  });
});

import { describe, expect, it } from "vitest";
import { isAnonymizedStudent } from "./types";

describe("isAnonymizedStudent", () => {
  it("uses the explicit anonymized flag as the only source of truth", () => {
    expect(isAnonymizedStudent({ anonymized: true })).toBe(true);
    expect(isAnonymizedStudent({ anonymized: false })).toBe(false);
  });

  it("does not infer anonymization when the student is unavailable", () => {
    expect(isAnonymizedStudent()).toBe(false);
    expect(isAnonymizedStudent(null)).toBe(false);
  });
});

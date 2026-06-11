import { describe, expect, it } from "vitest";

import { mask } from "./mask";

describe("mask", () => {
  it("applies the pattern using only numeric digits from the value", () => {
    expect(mask("12345678901", "###.###.###-##")).toBe("123.456.789-01");
    expect(mask("123.456.789-01", "###.###.###-##")).toBe("123.456.789-01");
  });

  it("stops formatting when the value runs out of digits", () => {
    expect(mask("12345", "###.###.###-##")).toBe("123.45.-");
    expect(mask("1", "(##) #####-####")).toBe("(1");
  });

  it("ignores extra digits beyond the amount required by the pattern", () => {
    expect(mask("123456789012345", "###-###")).toBe("123-456");
  });

  it("returns an empty string when there are no digits to place", () => {
    expect(mask("", "###.###")).toBe(".");
    expect(mask("abc", "###.###")).toBe(".");
  });
});

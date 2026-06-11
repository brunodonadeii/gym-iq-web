import { describe, expect, it } from "vitest";

import { formatCurrencyInput, parseCurrencyInput } from "./currency";

describe("currency utils", () => {
  it("parses currency input by stripping non-digits and dividing by 100", () => {
    expect(parseCurrencyInput("R$ 1.234,56")).toBe(1234.56);
    expect(parseCurrencyInput("123")).toBe(1.23);
    expect(parseCurrencyInput("abc")).toBe(0);
    expect(parseCurrencyInput("")).toBe(0);
  });

  it("formats currency input with two decimal places using pt-BR locale", () => {
    expect(formatCurrencyInput(1234.56)).toBe("1.234,56");
    expect(formatCurrencyInput(1)).toBe("1,00");
    expect(formatCurrencyInput(0)).toBe("0,00");
  });
});

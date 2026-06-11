import { describe, expect, it } from "vitest";

import { maskCpf, maskEmail, maskPhone } from "./sensitiveData";

describe("maskCpf", () => {
  it("returns a placeholder for missing values", () => {
    expect(maskCpf()).toBe("-");
    expect(maskCpf(null)).toBe("-");
  });

  it("preserves already masked values", () => {
    expect(maskCpf("123.***.***-00")).toBe("123.***.***-00");
  });

  it("returns the original value when cpf does not have 11 digits", () => {
    expect(maskCpf("1234567890")).toBe("1234567890");
    expect(maskCpf("abc")).toBe("abc");
  });

  it("masks valid cpf values", () => {
    expect(maskCpf("12345678901")).toBe("123.***.***-01");
    expect(maskCpf("123.456.789-01")).toBe("123.***.***-01");
  });
});

describe("maskPhone", () => {
  it("returns a placeholder for missing values", () => {
    expect(maskPhone()).toBe("-");
    expect(maskPhone(null)).toBe("-");
  });

  it("preserves already masked values", () => {
    expect(maskPhone("(11) *****-7890")).toBe("(11) *****-7890");
  });

  it("returns the original value when the phone has fewer than 10 digits", () => {
    expect(maskPhone("123456789")).toBe("123456789");
    expect(maskPhone("abc")).toBe("abc");
  });

  it("masks 10-digit and 11-digit phone values", () => {
    expect(maskPhone("11987654321")).toBe("(11) *****-4321");
    expect(maskPhone("(11) 9876-5432")).toBe("(11) ****-5432");
  });
});

describe("maskEmail", () => {
  it("returns a placeholder for missing values", () => {
    expect(maskEmail()).toBe("-");
    expect(maskEmail(null)).toBe("-");
    expect(maskEmail("")).toBe("-");
  });

  it("preserves already masked values", () => {
    expect(maskEmail("jo***@email.com")).toBe("jo***@email.com");
  });

  it("returns the original value when the e-mail is invalid", () => {
    expect(maskEmail("sem-arroba")).toBe("sem-arroba");
    expect(maskEmail("@dominio.com")).toBe("@dominio.com");
  });

  it("masks e-mails with short and long local parts", () => {
    expect(maskEmail("jo@email.com")).toBe("jo*@email.com");
    expect(maskEmail("joao@email.com")).toBe("jo*o@email.com");
    expect(maskEmail("mariana@email.com")).toBe("ma*****a@email.com");
  });
});

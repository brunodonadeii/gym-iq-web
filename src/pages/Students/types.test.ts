import { describe, expect, it } from "vitest";
import { isAnonymizedStudent } from "./types";

describe("isAnonymizedStudent", () => {
  it("identifies anonymized students from summary data", () => {
    expect(isAnonymizedStudent({ name: "ANONYMIZED" })).toBe(true);
    expect(isAnonymizedStudent({ name: "Aluno anonimizado" })).toBe(true);
  });

  it("uses the explicit anonymized flag when available", () => {
    expect(
      isAnonymizedStudent({
        anonymized: true,
        name: "Nome preservado para histórico",
      }),
    ).toBe(true);
  });

  it("does not block regular students", () => {
    expect(
      isAnonymizedStudent({
        anonymized: false,
        name: "Maria Silva",
        email: "maria@email.com",
      }),
    ).toBe(false);
  });
});

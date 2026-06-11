import { describe, expect, it } from "vitest";

import {
  formatCrefInput,
  validateInstructorCreate,
  validateInstructorUpdate,
} from "./instructorValidation";

describe("instructorValidation", () => {
  it("validates required and constrained fields on create", () => {
    expect(
      validateInstructorCreate({
        name: " ",
        email: "email-invalido",
        password: "123",
        cref: "123",
        phone: "1".repeat(21),
        specialty: "Especialidade inexistente",
        lgpdAccepted: false,
      }),
    ).toEqual({
      name: "Informe o nome.",
      email: "Informe um e-mail válido.",
      password: "A senha deve ter no mínimo 6 caracteres.",
      cref: "Informe o CREF no formato 123456-G/SP.",
      phone: "O telefone deve ter no máximo 20 caracteres.",
      specialty: "Selecione uma especialidade válida.",
      lgpdAccepted: "É necessário aceitar os termos de LGPD.",
    });
  });

  it("validates update data without password and lgpd fields", () => {
    expect(
      validateInstructorUpdate({
        name: "A",
        email: "",
        cref: "",
        phone: "",
        specialty: "",
      }),
    ).toEqual({
      name: "O nome deve ter entre 2 e 100 caracteres.",
      email: "Informe o e-mail.",
      cref: "Informe o CREF.",
      phone: "Informe o telefone.",
      specialty: "Selecione uma especialidade.",
    });
  });

  it("returns no errors for valid create data", () => {
    expect(
      validateInstructorCreate({
        name: "Marina",
        email: "marina@test.com",
        password: "123456",
        cref: "123456-G/SP",
        phone: "(11) 99999-9999",
        specialty: "Musculação",
        lgpdAccepted: true,
      }),
    ).toEqual({});
  });

  it("formats cref input progressively", () => {
    expect(formatCrefInput("123")).toBe("123");
    expect(formatCrefInput("123456g")).toBe("123456-G");
    expect(formatCrefInput("123456gsp")).toBe("123456-G/SP");
    expect(formatCrefInput("123456-g/sp-extra")).toBe("123456-G/SP");
  });
});

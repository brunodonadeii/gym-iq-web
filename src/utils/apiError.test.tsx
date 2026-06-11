import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { toastErrorSpy } = vi.hoisted(() => ({
  toastErrorSpy: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorSpy,
  },
}));

import {
  getApiFieldErrors,
  normalizeApiError,
  parseApiError,
  parseApiResponse,
  parseApiVoidResponse,
  showApiError,
} from "./apiError";

describe("normalizeApiError", () => {
  it("normalizes Error instances preserving status and field metadata", () => {
    const error = Object.assign(new Error("Falhou"), {
      status: 422,
      error: "Validação",
      fields: {
        email: "Inválido",
      },
    });

    const normalized = normalizeApiError(error);

    expect(normalized.name).toBe("ApiError");
    expect(normalized.status).toBe(422);
    expect(normalized.statusCode).toBe(422);
    expect(normalized.error).toBe("Validação");
    expect(normalized.message).toBe("Falhou");
    expect(normalized.fields).toEqual({
      email: "Inválido",
    });
  });

  it("normalizes string, object and nullish inputs with fallback behavior", () => {
    expect(normalizeApiError("Erro simples").message).toBe("Erro simples");

    expect(
      normalizeApiError(
        {
          error: "Negado",
          message: "Sem acesso",
          status: 403,
          fields: {
            email: "Obrigatório",
            ignored: 1,
          },
        },
        "Fallback",
      ),
    ).toMatchObject({
      error: "Negado",
      message: "Sem acesso",
      status: 403,
      fields: {
        email: "Obrigatório",
      },
    });

    expect(normalizeApiError(null, "Fallback").message).toBe("Fallback");
  });
});

describe("parseApiError and parseApiResponse", () => {
  it("parses string error responses", async () => {
    const response = new Response("Mensagem da API", {
      status: 400,
    });

    const error = await parseApiError(response, "Fallback");

    expect(error).toMatchObject({
      status: 400,
      message: "Mensagem da API",
    });
  });

  it("parses json error responses preserving metadata", async () => {
    const response = new Response(
      JSON.stringify({
        error: "Validação",
        message: "Dados inválidos",
        fields: {
          email: "Inválido",
        },
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      },
    );

    const error = await parseApiError(response, "Fallback");

    expect(error).toMatchObject({
      error: "Validação",
      message: "Dados inválidos",
      status: 422,
      fields: {
        email: "Inválido",
      },
    });
  });

  it("returns parsed data for successful responses and throws normalized errors otherwise", async () => {
    const okResponse = new Response(
      JSON.stringify({
        id: 1,
        name: "Gym IQ",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );

    await expect(parseApiResponse(okResponse)).resolves.toEqual({
      id: 1,
      name: "Gym IQ",
    });

    const errorResponse = new Response("Falhou", {
      status: 500,
    });

    await expect(parseApiResponse(errorResponse, "Fallback")).rejects.toMatchObject({
      status: 500,
      message: "Falhou",
    });
  });

  it("handles void responses and 204 responses", async () => {
    const noContentResponse = new Response(null, {
      status: 204,
    });

    await expect(parseApiResponse(noContentResponse)).resolves.toBeNull();
    await expect(parseApiVoidResponse(noContentResponse)).resolves.toBeUndefined();
  });

  it("throws for failed void responses", async () => {
    const response = new Response(
      JSON.stringify({
        message: "Erro ao remover",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );

    await expect(parseApiVoidResponse(response, "Fallback")).rejects.toMatchObject({
      status: 400,
      message: "Erro ao remover",
    });
  });
});

describe("showApiError and getApiFieldErrors", () => {
  it("shows a toast and returns the normalized error", () => {
    const error = showApiError(
      {
        error: "Erro",
        message: "Algo deu errado",
      },
      "Fallback",
    );

    expect(error).toMatchObject({
      error: "Erro",
      message: "Algo deu errado",
    });
    expect(toastErrorSpy).toHaveBeenCalledTimes(1);

    const toastNode = toastErrorSpy.mock.calls[0][0];
    render(toastNode);

    expect(screen.getByText("Erro")).toBeInTheDocument();
    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
  });

  it("returns only allowed non-empty field errors", () => {
    expect(
      getApiFieldErrors(
        {
          fields: {
            email: "E-mail inválido",
            password: " ",
            ignored: "Não deve aparecer",
          },
        },
        ["email", "password"] as const,
      ),
    ).toEqual({
      email: "E-mail inválido",
    });

    expect(getApiFieldErrors({}, ["email"] as const)).toBeNull();
  });
});

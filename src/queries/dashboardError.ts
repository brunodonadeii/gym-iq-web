export class DashboardRequestError extends Error {
  status: number;
  erro?: string;
  mensagem?: string;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "DashboardRequestError";
    this.status = status;

    if (details && typeof details === "object") {
      const apiDetails = details as { erro?: string; mensagem?: string };

      this.erro = apiDetails.erro;
      this.mensagem = apiDetails.mensagem;
    }
  }
}

export async function throwDashboardRequestError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  const details = await response.json().catch(() => null);
  const message =
    details && typeof details === "object" && "mensagem" in details
      ? String(details.mensagem)
      : fallbackMessage;

  throw new DashboardRequestError(message, response.status, details);
}

type DashboardErrorDetails = {
  error?: string;
  message?: string;
};

export class DashboardRequestError extends Error {
  status: number;
  error?: string;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "DashboardRequestError";
    this.status = status;

    if (details && typeof details === "object") {
      const apiDetails = details as DashboardErrorDetails;
      this.error = apiDetails.error;
    }
  }
}

export async function throwDashboardRequestError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  const details = await response.json().catch(() => null);
  const message =
    details && typeof details === "object" && "message" in details
      ? String((details as DashboardErrorDetails).message)
      : fallbackMessage;

  throw new DashboardRequestError(message, response.status, details);
}


import { DashboardRequestError } from "@/queries/dashboardError";

const numberFormatter = new Intl.NumberFormat("pt-BR");

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

export const formatNumber = (value?: number) => numberFormatter.format(value ?? 0);

export const formatDecimal = (value?: number) =>
  decimalFormatter.format(value ?? 0);

export const formatCurrency = (value?: number) =>
  currencyFormatter.format(value ?? 0);

export const formatPercent = (value?: number) =>
  `${percentFormatter.format(value ?? 0)}%`;

export const formatDateTime = (value?: string) => {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof DashboardRequestError) {
    return error.mensagem ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const apiError = error as {
      mensagem?: string;
      message?: string;
      erro?: string;
    };

    return apiError.mensagem ?? apiError.message ?? apiError.erro ?? fallback;
  }

  return fallback;
};

export const isForbiddenError = (error: unknown) =>
  error instanceof DashboardRequestError && error.status === 403;

export const hasPositiveValues = (values: number[]) =>
  values.some((value) => value > 0);

import { toast } from "sonner";

export type ApiError = Error & {
  status?: number;
  erro?: string;
  mensagem?: string;
  details?: unknown;
};

const DEFAULT_ERROR_TITLE = "Erro";
const DEFAULT_ERROR_MESSAGE = "Nao foi possivel concluir a operacao.";

const createApiError = ({
  status,
  erro,
  mensagem,
  message,
  details,
}: {
  status?: number;
  erro?: string;
  mensagem?: string;
  message?: string;
  details?: unknown;
}) => {
  const normalizedMessage = mensagem ?? message ?? erro ?? DEFAULT_ERROR_MESSAGE;
  const error = new Error(normalizedMessage) as ApiError;

  error.name = "ApiError";
  error.status = status;
  error.erro = erro ?? DEFAULT_ERROR_TITLE;
  error.mensagem = mensagem ?? normalizedMessage;
  error.details = details;

  return error;
};

const getObjectValue = (value: unknown, key: string) => {
  if (!value || typeof value !== "object" || !(key in value)) {
    return undefined;
  }

  const result = (value as Record<string, unknown>)[key];
  return typeof result === "string" && result.trim() ? result : undefined;
};

async function readResponseData(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text().catch(() => "");

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) {
  if (error instanceof Error) {
    return createApiError({
      message: error.message || fallbackMessage,
      details: error,
    });
  }

  if (typeof error === "string") {
    return createApiError({
      message: error || fallbackMessage,
      details: error,
    });
  }

  if (error && typeof error === "object") {
    const erro = getObjectValue(error, "erro");
    const mensagem = getObjectValue(error, "mensagem");
    const message = getObjectValue(error, "message");
    const statusValue = (error as { status?: unknown }).status;
    const status = typeof statusValue === "number" ? statusValue : undefined;

    return createApiError({
      status,
      erro,
      mensagem,
      message: message ?? fallbackMessage,
      details: error,
    });
  }

  return createApiError({
    message: fallbackMessage,
    details: error,
  });
}

export async function parseApiError(
  response: Response,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) {
  const details = await readResponseData(response);

  if (typeof details === "string") {
    return createApiError({
      status: response.status,
      message: details || fallbackMessage,
      details,
    });
  }

  return normalizeApiError(
    {
      ...(details && typeof details === "object" ? details : {}),
      status: response.status,
    },
    fallbackMessage,
  );
}

export async function parseApiResponse<T>(
  response: Response,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) {
  if (!response.ok) {
    throw await parseApiError(response, fallbackMessage);
  }

  return (await readResponseData(response)) as T;
}

export async function parseApiVoidResponse(
  response: Response,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) {
  if (!response.ok) {
    throw await parseApiError(response, fallbackMessage);
  }
}

export function showApiError(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) {
  const apiError = normalizeApiError(error, fallbackMessage);

  toast.error(
    <div>
      <strong>{apiError.erro ?? DEFAULT_ERROR_TITLE}</strong>
      <br />
      <span>{apiError.mensagem ?? fallbackMessage}</span>
    </div>,
  );

  return apiError;
}

import { toast } from "sonner";

export type ApiError = Error & {
  status?: number;
  statusCode?: number;
  error?: string;
  fields?: Record<string, string>;
  message: string;
  path?: string;
  timestamp?: string;
  details?: unknown;
};

const DEFAULT_ERROR_TITLE = "Erro";
const DEFAULT_ERROR_MESSAGE = "Não foi possível concluir a operação.";

type ApiErrorInput = {
  status?: number;
  title?: string;
  message?: string;
  path?: string;
  timestamp?: string;
  fields?: Record<string, string>;
  details?: unknown;
};

const getObjectValue = (value: unknown, key: string) => {
  if (!value || typeof value !== "object" || !(key in value)) {
    return undefined;
  }

  const result = (value as Record<string, unknown>)[key];
  return typeof result === "string" && result.trim() ? result : undefined;
};

const getObjectNumber = (value: unknown, key: string) => {
  if (!value || typeof value !== "object" || !(key in value)) {
    return undefined;
  }

  const result = (value as Record<string, unknown>)[key];
  return typeof result === "number" ? result : undefined;
};

const getObjectRecord = (value: unknown, key: string) => {
  if (!value || typeof value !== "object" || !(key in value)) {
    return undefined;
  }

  const result = (value as Record<string, unknown>)[key];

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return undefined;
  }

  const entries = Object.entries(result).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return entries.length ? Object.fromEntries(entries) : undefined;
};

const createApiError = ({
  status,
  title,
  message,
  path,
  timestamp,
  fields,
  details,
}: ApiErrorInput) => {
  const normalizedTitle = title ?? DEFAULT_ERROR_TITLE;
  const normalizedMessage = message ?? DEFAULT_ERROR_MESSAGE;
  const apiError = new Error(normalizedMessage) as ApiError;

  apiError.name = "ApiError";
  apiError.status = status;
  apiError.statusCode = status;
  apiError.error = normalizedTitle;
  apiError.message = normalizedMessage;
  apiError.path = path;
  apiError.timestamp = timestamp;
  apiError.fields = fields;
  apiError.details = details;

  return apiError;
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
    const apiError = error as ApiError;

    return createApiError({
      status: apiError.status ?? apiError.statusCode,
      title: apiError.error ?? error.name ?? DEFAULT_ERROR_TITLE,
      message: error.message ?? fallbackMessage,
      path: apiError.path,
      timestamp: apiError.timestamp,
      fields: apiError.fields,
      details: apiError.details ?? error,
    });
  }

  if (typeof error === "string") {
    return createApiError({
      message: error || fallbackMessage,
      details: error,
    });
  }

  if (error && typeof error === "object") {
    const title = getObjectValue(error, "error") ?? DEFAULT_ERROR_TITLE;
    const message = getObjectValue(error, "message") ?? fallbackMessage;
    const status =
      getObjectNumber(error, "status") ?? getObjectNumber(error, "statusCode");

    return createApiError({
      status,
      title,
      message,
      path: getObjectValue(error, "path"),
      timestamp: getObjectValue(error, "timestamp"),
      fields: getObjectRecord(error, "fields"),
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
      <strong>{apiError.error ?? DEFAULT_ERROR_TITLE}</strong>
      <br />
      <span>{apiError.message ?? fallbackMessage}</span>
    </div>,
  );

  return apiError;
}



const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object";

const getErrorCode = (error: unknown) => {
  if (!isRecord(error)) return null;

  return typeof error.error === "string" ? error.error : null;
};

const getErrorStatus = (error: unknown) => {
  if (!isRecord(error)) return null;

  const status = error.status ?? error.statusCode;
  return typeof status === "number" ? status : null;
};

export const isResourceNotFoundError = (error: unknown) =>
  getErrorStatus(error) === 404 || getErrorCode(error) === "RESOURCE_NOT_FOUND";

export const isInvalidParameterError = (error: unknown) =>
  getErrorStatus(error) === 400 || getErrorCode(error) === "INVALID_PARAMETER";

export const isDetailLoadError = (error: unknown) =>
  isResourceNotFoundError(error) || isInvalidParameterError(error);


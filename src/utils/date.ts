const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const formatLocalDate = (
  value?: string | null,
  fallback = "Não informado",
) => {
  if (!value) return fallback;

  const match = LOCAL_DATE_PATTERN.exec(value.trim());

  if (!match) return fallback;

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
};

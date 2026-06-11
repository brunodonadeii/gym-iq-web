const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const toLocalDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

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

export const isLocalDateBeforeToday = (
  value?: string | null,
  today = new Date(),
) => {
  const normalizedValue = value?.trim() ?? "";

  if (!LOCAL_DATE_PATTERN.test(normalizedValue)) return false;

  return normalizedValue < toLocalDateValue(today);
};

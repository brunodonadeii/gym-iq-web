export type DateRangeValue = {
  startDate: string;
  endDate: string;
};

export type DateRangePresetKey =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisWeek"
  | "thisMonth"
  | "custom";

export const DATE_RANGE_PRESETS: Array<{
  key: DateRangePresetKey;
  label: string;
}> = [
  { key: "today", label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "last7Days", label: "Últimos 7 dias" },
  { key: "last30Days", label: "Últimos 30 dias" },
  { key: "thisWeek", label: "Esta semana" },
  { key: "thisMonth", label: "Este mês" },
  { key: "custom", label: "Personalizado" },
];

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const shiftDays = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

const getWeekStart = (date: Date) => {
  const normalizedDay = (date.getDay() + 6) % 7;
  return shiftDays(date, -normalizedDay);
};

const areRangesEqual = (a: DateRangeValue, b: DateRangeValue) =>
  a.startDate === b.startDate && a.endDate === b.endDate;

export const getDateRangePresetValue = (
  preset: Exclude<DateRangePresetKey, "custom">,
  now = new Date(),
): DateRangeValue => {
  const today = toInputDate(now);

  switch (preset) {
    case "today":
      return { startDate: today, endDate: today };
    case "yesterday": {
      const yesterday = toInputDate(shiftDays(now, -1));
      return { startDate: yesterday, endDate: yesterday };
    }
    case "last7Days":
      return {
        startDate: toInputDate(shiftDays(now, -6)),
        endDate: today,
      };
    case "last30Days":
      return {
        startDate: toInputDate(shiftDays(now, -29)),
        endDate: today,
      };
    case "thisWeek":
      return {
        startDate: toInputDate(getWeekStart(now)),
        endDate: today,
      };
    case "thisMonth":
      return {
        startDate: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: today,
      };
  }
};

export const getMatchingDateRangePreset = (
  value: DateRangeValue,
  now = new Date(),
): DateRangePresetKey => {
  const comparablePresets: Exclude<DateRangePresetKey, "custom">[] = [
    "today",
    "yesterday",
    "last7Days",
    "last30Days",
    "thisWeek",
    "thisMonth",
  ];

  const matchedPreset = comparablePresets.find((preset) =>
    areRangesEqual(value, getDateRangePresetValue(preset, now)),
  );

  return matchedPreset ?? "custom";
};

export const formatDateRangeLabel = (value: DateRangeValue) => {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (!value.startDate || !value.endDate) {
    return "Selecione um período";
  }

  const startDate = new Date(`${value.startDate}T00:00:00`);
  const endDate = new Date(`${value.endDate}T00:00:00`);

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
};

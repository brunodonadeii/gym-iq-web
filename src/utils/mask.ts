export const mask = (value: string, pattern: string) => {
  let i = 0;
  const digits = value.replace(/\D/g, "");
  return pattern.replace(/#/g, () => digits[i++] ?? "").replace(/#.*/g, "");
};

const onlyDigits = (value?: string | null) => (value ?? "").replace(/\D/g, "");

export const maskCpf = (value?: string | null) => {
  const digits = onlyDigits(value);

  if (digits.length !== 11) {
    return value ?? "-";
  }

  return `${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;
};

export const maskPhone = (value?: string | null) => {
  const digits = onlyDigits(value);

  if (digits.length < 10) {
    return value ?? "-";
  }

  const ddd = digits.slice(0, 2);
  const suffix = digits.slice(-4);

  if (digits.length === 11) {
    return `(${ddd}) *****-${suffix}`;
  }

  return `(${ddd}) ****-${suffix}`;
};

export const maskEmail = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const [localPart, domain] = value.split("@");

  if (!localPart || !domain) {
    return value;
  }

  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.length > 4 ? localPart.slice(-1) : "";
  const maskedMiddle = "*".repeat(Math.max(localPart.length - 2 - visibleEnd.length, 1));

  return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
};

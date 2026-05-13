import { mask } from "@/utils/mask";

export function useFormInputs<T>(
  setData: React.Dispatch<React.SetStateAction<T>>,
) {
  const set =
    (field: keyof T) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) =>
      setData((prev) => ({ ...prev, [field]: e.target.value }));

  const setMasked =
    (field: keyof T, pattern: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((prev) => ({ ...prev, [field]: mask(e.target.value, pattern) }));

  return { set, setMasked };
}

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { maskSpy } = vi.hoisted(() => ({
  maskSpy: vi.fn(),
}));

vi.mock("@/utils/mask", () => ({
  mask: maskSpy,
}));

import { useFormInputs } from "./useFormInputs";

describe("useFormInputs", () => {
  it("updates the selected field while preserving the other values", () => {
    const setData = vi.fn();
    const { result } = renderHook(() => useFormInputs(setData));

    result.current.set("name")({
      target: { value: "Bruno" },
    } as React.ChangeEvent<HTMLInputElement>);

    expect(setData).toHaveBeenCalledTimes(1);

    const updater = setData.mock.calls[0][0] as (
      prev: Record<string, string>,
    ) => Record<string, string>;

    expect(updater({ name: "", email: "mail@test.com" })).toEqual({
      name: "Bruno",
      email: "mail@test.com",
    });
  });

  it("supports select-like change events with the generic setter", () => {
    const setData = vi.fn();
    const { result } = renderHook(() => useFormInputs(setData));

    result.current.set("role")({
      target: { value: "ADMIN" },
    } as React.ChangeEvent<HTMLSelectElement>);

    const updater = setData.mock.calls[0][0] as (
      prev: Record<string, string>,
    ) => Record<string, string>;

    expect(updater({ role: "STUDENT", name: "Bruno" })).toEqual({
      role: "ADMIN",
      name: "Bruno",
    });
  });

  it("applies the mask helper before storing a masked field", () => {
    const setData = vi.fn();
    maskSpy.mockReturnValue("(11) 98765-4321");
    const { result } = renderHook(() => useFormInputs(setData));

    result.current.setMasked("phone", "(##) #####-####")({
      target: { value: "11987654321" },
    } as React.ChangeEvent<HTMLInputElement>);

    expect(maskSpy).toHaveBeenCalledWith("11987654321", "(##) #####-####");

    const updater = setData.mock.calls[0][0] as (
      prev: Record<string, string>,
    ) => Record<string, string>;

    expect(updater({ phone: "", name: "Bruno" })).toEqual({
      phone: "(11) 98765-4321",
      name: "Bruno",
    });
  });
});

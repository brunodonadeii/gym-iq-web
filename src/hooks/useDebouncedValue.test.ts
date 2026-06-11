import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("initial"));

    expect(result.current).toBe("initial");
  });

  it("updates only after the debounce delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: "first", delay: 200 },
      },
    );

    rerender({ value: "second", delay: 200 });

    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(199);
    });

    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("second");
  });

  it("clears the previous timeout when the value changes again before the delay", () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: "first", delay: 300 },
      },
    );

    rerender({ value: "second", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    rerender({ value: "third", delay: 300 });

    expect(clearTimeoutSpy).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("third");
  });
});

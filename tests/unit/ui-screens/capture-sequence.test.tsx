// F6.1: linha do tempo da captura com fake timers do Vitest no hook (nao no Playwright).
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const played: string[] = [];
vi.mock("../../../src/audio/sfx", () => ({ playSfx: (name: string) => played.push(name) }));

const { captureBackground, stageClass, useCaptureSequence, CAPTURE_FINAL_AT } = await import("../../../src/components/CaptureOverlay");

describe("capture sequence", () => {
  beforeEach(() => {
    played.length = 0;
    vi.useFakeTimers();
    document.documentElement.classList.remove("reduce-motion");
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires the 7 sounds in order, reaches s-final once and closing plays pokedex_close", () => {
    const onFinal = vi.fn();
    const onClosed = vi.fn();
    const { result } = renderHook(() => useCaptureSequence(onFinal, onClosed));
    expect(result.current.stage).toBe("on");
    act(() => void vi.advanceTimersByTime(450));
    expect(result.current.stage).toBe("s-bg");
    act(() => void vi.advanceTimersByTime(550));
    expect(result.current.stage).toBe("s-ball");
    act(() => void vi.advanceTimersByTime(CAPTURE_FINAL_AT - 1000));
    expect(result.current.stage).toBe("s-final");
    expect(played).toEqual([
      "poke_ball_throw_1",
      "poke_ball_shake_1",
      "poke_ball_shake_2",
      "poke_ball_shake_3",
      "poke_ball_open",
      "poke_ball_shake_critical",
      "poke_ball_capture_succeeded",
    ]);
    expect(onFinal).toHaveBeenCalledTimes(1);
    act(() => result.current.close());
    act(() => result.current.close());
    expect(played.at(-1)).toBe("pokedex_close");
    expect(played).toHaveLength(8);
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it("skip jumps to s-final, clears pending timers and finishes only once", () => {
    const onFinal = vi.fn();
    const { result } = renderHook(() => useCaptureSequence(onFinal, vi.fn()));
    act(() => void vi.advanceTimersByTime(1800));
    act(() => result.current.skip());
    act(() => result.current.skip());
    expect(result.current.stage).toBe("s-final");
    act(() => void vi.advanceTimersByTime(10_000));
    expect(played).toEqual(["poke_ball_throw_1", "poke_ball_shake_1", "poke_ball_capture_succeeded"]);
    expect(onFinal).toHaveBeenCalledTimes(1);
  });

  it("unmount mid-sequence clears the timers (navigation during capture)", () => {
    const onFinal = vi.fn();
    const { unmount } = renderHook(() => useCaptureSequence(onFinal, vi.fn()));
    act(() => void vi.advanceTimersByTime(1000));
    unmount();
    vi.advanceTimersByTime(10_000);
    expect(played).toEqual(["poke_ball_throw_1"]);
    expect(onFinal).not.toHaveBeenCalled();
  });

  it("reduce motion goes straight to s-final after 300 ms", () => {
    document.documentElement.classList.add("reduce-motion");
    const onFinal = vi.fn();
    const { result } = renderHook(() => useCaptureSequence(onFinal, vi.fn()));
    act(() => void vi.advanceTimersByTime(299));
    expect(result.current.stage).toBe("on");
    act(() => void vi.advanceTimersByTime(1));
    expect(result.current.stage).toBe("s-final");
    expect(onFinal).toHaveBeenCalledTimes(1);
  });

  it("background by labels, never by bucket; stage classes keep s-bg", () => {
    expect(captureBackground(["legendary"])).toBe("bg-lendario");
    expect(captureBackground(["gen1", "mythical"])).toBe("bg-mitico");
    expect(captureBackground(["gen1"])).toBe("bg-outros");
    expect(stageClass("on")).toBe("capture on");
    expect(stageClass("s-shake")).toBe("capture on s-bg s-shake");
  });
});

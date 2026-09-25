// T1: ToastHost (src/components/Toast.tsx, F1.4): toast normal fecha sozinho em 4s; toast persistente (erro de
// storage) fica ate o X ser clicado. usePwaUpdateStore fixado como "sem update" para nao interferir no host.
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastHost } from "../../../src/components/Toast";
import { TOAST_DURATION_MS, useShellStore } from "../../../src/state/shell-store";
import { usePwaUpdateStore } from "../../../src/pwa/update-store";

describe("ToastHost", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useShellStore.setState({ toasts: [], moreOpen: false });
    usePwaUpdateStore.setState({ waiting: null, dismissed: false });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("sem toasts nem update pendente, nao renderiza nada", () => {
    render(<ToastHost />);
    expect(document.querySelector(".toast-host")).toBeNull();
  });

  it("toast normal (info) some sozinho apos TOAST_DURATION_MS", () => {
    render(<ToastHost />);
    act(() => {
      useShellStore.getState().pushToast("sync.generate");
    });
    expect(screen.getByRole("status")).toBeTruthy();
    act(() => void vi.advanceTimersByTime(TOAST_DURATION_MS - 1));
    expect(screen.getByRole("status")).toBeTruthy();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("toast persistente (erro de storage) NAO some sozinho; so fecha pelo X", () => {
    render(<ToastHost />);
    act(() => {
      useShellStore.getState().pushToast("error.storage", { tone: "error", persistent: true });
    });
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("toast-error");
    act(() => void vi.advanceTimersByTime(60_000));
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("toasts persistentes duplicados (mesma chave) nao se acumulam", () => {
    act(() => {
      useShellStore.getState().pushToast("error.storage", { tone: "error", persistent: true });
      useShellStore.getState().pushToast("error.storage", { tone: "error", persistent: true });
    });
    expect(useShellStore.getState().toasts).toHaveLength(1);
  });
});

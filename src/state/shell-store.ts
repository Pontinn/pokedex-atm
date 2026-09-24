// Estado do shell (F1.4): sheet "Mais" do mobile e fila de toasts.
import { create } from "zustand";
import type { MessageKey } from "../i18n/messages";

export const TOAST_DURATION_MS = 4000;

export interface ToastItem {
  id: number;
  messageKey: MessageKey;
  tone: "info" | "error";
  /** persistente = so fecha no X (erros de storage) */
  persistent: boolean;
}

export interface ShellState {
  moreOpen: boolean;
  toasts: ToastItem[];
  setMoreOpen(open: boolean): void;
  pushToast(messageKey: MessageKey, opts?: { tone?: ToastItem["tone"]; persistent?: boolean }): number;
  dismissToast(id: number): void;
}

let nextToastId = 1;

export const useShellStore = create<ShellState>()((set) => ({
  moreOpen: false,
  toasts: [],
  setMoreOpen(open) {
    set({ moreOpen: open });
  },
  pushToast(messageKey, opts) {
    const id = nextToastId++;
    const toast: ToastItem = { id, messageKey, tone: opts?.tone ?? "info", persistent: opts?.persistent ?? false };
    // mesma mensagem persistente nao duplica
    set((s) => (toast.persistent && s.toasts.some((t) => t.persistent && t.messageKey === messageKey) ? s : { toasts: [...s.toasts, toast] }));
    return id;
  },
  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

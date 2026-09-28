// Fila global de toasts (F1.4): 4 s, ou persistente (erros de storage) ate fechar no X.
import { useEffect } from "react";
import { X } from "./Icon";
import { useT } from "../i18n/useT";
import { TOAST_DURATION_MS, useShellStore, type ToastItem } from "../state/shell-store";

function ToastView({ toast }: { toast: ToastItem }) {
  const t = useT();
  const dismiss = useShellStore((s) => s.dismissToast);
  useEffect(() => {
    if (toast.persistent) return undefined;
    const timer = setTimeout(() => dismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);
  return (
    <div className={`toast toast-${toast.tone}`} role={toast.tone === "error" ? "alert" : "status"}>
      <span className="toast-text">{t(toast.messageKey)}</span>
      <button type="button" className="toast-close" aria-label={t("shell.close")} onClick={() => dismiss(toast.id)}>
        <X />
      </button>
    </div>
  );
}

export function ToastHost() {
  const toasts = useShellStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="toast-host">
      {toasts.map((toast) => (
        <ToastView key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

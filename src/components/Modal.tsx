// Modal (UISPEC 8.3): centralizado no desktop, sheet-panel no mobile. Esc e clique no fundo fecham.
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "./Icon";
import { useT } from "../i18n/useT";
import { useIsMobile } from "./useIsMobile";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose(): void;
  title?: ReactNode;
  children: ReactNode;
}) {
  const t = useT();
  const mobile = useIsMobile();
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const body = (
    <>
      <div className="modal-head">
        {title ? <h3 className="modal-title">{title}</h3> : null}
        <button type="button" className="tgl modal-close" aria-label={t("shell.close")} onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </>
  );
  return createPortal(
    mobile ? (
      <div className="sheet open modal-sheet" role="dialog" aria-modal="true">
        <div className="sheet-bg" onClick={onClose} />
        <div className="sheet-panel">
          <div className="sheet-handle" />
          {body}
        </div>
      </div>
    ) : (
      <div className="modal-layer" role="dialog" aria-modal="true">
        <div className="modal-bg" onClick={onClose} />
        <div className="modal card">{body}</div>
      </div>
    ),
    document.body,
  );
}

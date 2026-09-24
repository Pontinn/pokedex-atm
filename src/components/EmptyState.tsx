// Estado vazio explicito no padrao .ob-none (UISPEC 5, "Estados vazio/erro").
import type { ReactNode } from "react";
import pokeballUrl from "../assets/pokeball.webp";
import { useT } from "../i18n/useT";
import type { MessageKey } from "../i18n/messages";

export function EmptyState({ messageKey = "empty.generic", children }: { messageKey?: MessageKey; children?: ReactNode }) {
  const t = useT();
  return (
    <div className="empty-state ob-none">
      <span className="ob-ico" aria-hidden="true">
        <img src={pokeballUrl} alt="" />
      </span>
      <div className="empty-state-body">
        <p className="empty-state-text">{t(messageKey)}</p>
        {children}
      </div>
    </div>
  );
}

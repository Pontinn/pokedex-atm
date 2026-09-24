// Erro de carga inline com "Tentar de novo" (regra geral de Frontend: falhas de fetch do dataset).
import { Info, RotateCcw } from "./Icon";
import { useT } from "../i18n/useT";
import type { MessageKey } from "../i18n/messages";

export function InlineError({ messageKey = "error.load", onRetry }: { messageKey?: MessageKey; onRetry?: () => void }) {
  const t = useT();
  return (
    <div className="notice inline-error" role="alert">
      <Info />
      <span className="inline-error-text">{t(messageKey)}</span>
      {onRetry ? (
        <button type="button" className="btn btn-ghost inline-error-retry" onClick={onRetry}>
          <RotateCcw />
          {t("error.retry")}
        </button>
      ) : null}
    </div>
  );
}

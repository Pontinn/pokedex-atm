// Cabecalho "Seu progresso" (F8.2; porta trHeaderHTML, app.js:1087-1093): cap vigente de computeSeriesCap (B6.3),
// barra de progresso e "Proximo: {treinadores disponiveis}". Calculado sobre a serie INTEIRA (a busca nao mexe aqui).
import { memo } from "react";
import { useT } from "../../i18n/useT";

export interface CapHeaderProps {
  cap: number;
  defeated: number;
  total: number;
  nextNames: readonly string[];
}

export const CapHeader = memo(function CapHeader({ cap, defeated, total, nextNames }: CapHeaderProps) {
  const t = useT();
  const pct = total > 0 ? (defeated / total) * 100 : 0;
  return (
    <div className="card tr-headcard" id="tr-header">
      <h3>{t("tr.progress")}</h3>
      <div className="tr-cap">
        <span className="tr-cap-k">{t("tr.currentCap")}</span>
        <span className="tr-cap-v" data-testid="tr-cap">
          {cap}
        </span>
      </div>
      <div className="tr-prog">
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={defeated}>
          <div className="progress-bar" style={{ ["--p" as string]: `${pct}%` }} />
        </div>
        <div className="summary-foot tr-summary">
          <span data-testid="tr-count">
            {`${defeated} ${t("tr.done")} ${total} ${t("tr.keyTrainers")}`}
          </span>
          {nextNames.length > 0 ? (
            <span className="tr-next" data-testid="tr-next">
              {`${t("tr.next")}: ${nextNames.join(", ")}`}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
});

// Resumo de capturados na Home (F2.2; RF-52/RF-114): "X de {counts.species}" do manifesto, barra de progresso e
// "Ver todos" -> Capturados. Conta so especies do dataset atual (orfaos escondidos, RF-123).
import { memo } from "react";
import { useT } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useCapturedHydrated, useCapturedKnownCount } from "../../state/captured-store";
import { useDatasetStore } from "../../state/dataset-store";
import { usePreferencesStore } from "../../state/preferences-store";

export const CapturedSummaryCard = memo(function CapturedSummaryCard() {
  const t = useT();
  const { go } = useNavigationActions();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const total = useDatasetStore((s) => s.manifest?.counts.species ?? 0);
  useCapturedHydrated();
  const caught = useCapturedKnownCount();
  const locale = lang === "en" ? "en-US" : "pt-BR";
  const ratio = total > 0 ? Math.min(caught / total, 1) : 0;
  const pct = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(ratio);
  return (
    <div className="card card-summary" id="home-summary">
      <div className="card-head">
        <h3>{t("home.caught")}</h3>
        <button type="button" className="link" data-nav="" onClick={() => go("captured")}>
          {t("home.seeAll")}
        </button>
      </div>
      <div className="summary-big">
        <strong className="summary-count">{caught.toLocaleString(locale)}</strong>
        <span className="summary-of">{` ${t("home.of")} ${total.toLocaleString(locale)}`}</span>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={caught}>
        <div className="progress-bar" style={{ ["--p" as string]: `${ratio * 100}%` }} />
      </div>
      <div className="summary-foot">
        <span className="summary-pct">{pct}</span>
      </div>
    </div>
  );
});

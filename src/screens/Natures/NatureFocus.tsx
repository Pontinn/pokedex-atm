// Painel da natureza escolhida: nome grande (nome em ingles menor quando a UI esta em pt), chips +10% / -10%
// (ou o chip cinza "Neutra") e uma frase de uso gerada por template.
import { memo } from "react";
import { getNature } from "../../domain/natures";
import { useT } from "../../i18n/useT";
import { usePreferencesStore } from "../../state/preferences-store";
import { DOWN_SIGN, STAT_LABEL, UP_SIGN, isNeutral, natureName } from "./natures-model";

export const NatureFocus = memo(function NatureFocus({ id }: { id: string }) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const nature = getNature(id);
  if (!nature) return null;
  const neutral = isNeutral(nature);
  const up = nature.up ? t(STAT_LABEL[nature.up]) : "";
  const down = nature.down ? t(STAT_LABEL[nature.down]) : "";
  return (
    <section className="panel nt-focus" data-focus={nature.id} aria-label={t("natures.focusLabel")}>
      <div className="nt-focus-name">
        <h3>{natureName(nature, lang)}</h3>
        {lang === "pt" ? <p className="nt-focus-en">{natureName(nature, "en")}</p> : null}
      </div>
      <div className="nt-focus-chips">
        {neutral ? (
          <span className="nt-big-chip tone-zero" data-chip="neutral">
            {t("natures.chipNeutral")}
          </span>
        ) : (
          <>
            <span className="nt-big-chip tone-adv" data-chip="up">
              <b>{UP_SIGN}</b> <span>{up}</span>
            </span>
            <span className="nt-big-chip tone-dis" data-chip="down">
              <b>{DOWN_SIGN}</b> <span>{down}</span>
            </span>
          </>
        )}
      </div>
      <p className="nt-use">{neutral ? t("natures.useNeutral") : t("natures.useHint", { up, down })}</p>
    </section>
  );
});

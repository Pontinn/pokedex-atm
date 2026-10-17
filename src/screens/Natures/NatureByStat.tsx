// Visao "Por status": 5 chips de status; ao escolher um, faixa verde com as 4 naturezas que o aumentam (cada uma com o
// "-status" que perde), faixa laranja com as 4 que o diminuem (com o "+status" que ganha) e a faixa cinza fixa das neutras.
import { memo } from "react";
import { Check } from "../../components/Icon";
import type { BattleStatKey, Nature } from "../../domain/natures";
import { useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { usePreferencesStore } from "../../state/preferences-store";
import { BATTLE_STATS, MINUS, NEUTRAL_NATURES, PLUS, STAT_LABEL, natureName, statGroups } from "./natures-model";
import { selectNature } from "./select";

function NaturePick({ nature, note }: { nature: Nature; note?: string }) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const selected = useScreenUi("natures", "selected");
  const on = nature.id === selected;
  const name = natureName(nature, lang);
  return (
    <li>
      <button
        type="button"
        className={`nt-band-pick${on ? " on" : ""}`}
        data-nature={nature.id}
        aria-pressed={on}
        aria-label={
          nature.up && nature.down
            ? t("natures.cellLabel", { name, up: t(STAT_LABEL[nature.up]), down: t(STAT_LABEL[nature.down]) })
            : t("natures.cellNeutral", { name })
        }
        onClick={() => selectNature(nature.id)}
      >
        <span className="nt-pick-name">{name}</span>
        {note ? <span className="nt-band-note">{note}</span> : null}
      </button>
    </li>
  );
}

export const NatureByStat = memo(function NatureByStat() {
  const t = useT();
  const { updateUi } = useNavigationActions();
  const stat = useScreenUi("natures", "stat");
  const label = (s: BattleStatKey) => t(STAT_LABEL[s]);
  const groups = stat !== null ? statGroups(stat) : null;
  return (
    <>
      <div className="panel nt-stat-panel">
        <div className="nt-stat-grid" role="group" aria-label={t("natures.statPickLabel")}>
          {BATTLE_STATS.map((s) => {
            const on = s === stat;
            return (
              <button
                key={s}
                type="button"
                className={`chip nt-stat${on ? " on" : ""}`}
                data-stat={s}
                aria-pressed={on}
                onClick={() => {
                  if (!on) updateUi<"natures">({ stat: s });
                }}
              >
                <span>{label(s)}</span>
                <Check className="chip-check" aria-hidden="true" />
              </button>
            );
          })}
        </div>
        {stat === null ? <p className="nt-instr nt-stat-instr">{t("natures.statPick")}</p> : null}
      </div>
      {groups ? (
        <div className="nt-bands" data-band-stat={groups.stat}>
          <section className="nt-band tone-adv" data-band="raise" aria-labelledby="nt-band-raise">
            <h4 id="nt-band-raise">{t("natures.raise", { stat: label(groups.stat) })}</h4>
            <ul className="nt-band-list">
              {groups.raise.map((n) => (
                <NaturePick key={n.id} nature={n} note={n.down ? `${MINUS}${label(n.down)}` : undefined} />
              ))}
            </ul>
          </section>
          <section className="nt-band tone-dis" data-band="lower" aria-labelledby="nt-band-lower">
            <h4 id="nt-band-lower">{t("natures.lower", { stat: label(groups.stat) })}</h4>
            <ul className="nt-band-list">
              {groups.lower.map((n) => (
                <NaturePick key={n.id} nature={n} note={n.up ? `${PLUS}${label(n.up)}` : undefined} />
              ))}
            </ul>
          </section>
        </div>
      ) : null}
      <section className="nt-band tone-zero" data-band="neutral" aria-labelledby="nt-band-neutral">
        <h4 id="nt-band-neutral">{t("natures.neutrals")}</h4>
        <ul className="nt-band-list">
          {NEUTRAL_NATURES.map((n) => (
            <NaturePick key={n.id} nature={n} />
          ))}
        </ul>
      </section>
    </>
  );
});

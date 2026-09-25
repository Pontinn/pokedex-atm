// Picker de series (F8.1; prototipo renderTrainers .chips-scroll/.seg-chip, app.js:1124). Bloqueio por
// requiredSeries (RF-111) com "Requer: {titulo}", Modo Livre bloqueado sem serie concluida (levelCapConfig).
import { memo } from "react";
import { Lock } from "lucide-react";
import { Check } from "../../components/Icon";
import type { UiLanguage } from "../../storage/types";
import { gameName, useT } from "../../i18n/useT";
import type { SeriesChipView } from "./trainer-model";

export interface SeriesPickerProps {
  chips: readonly SeriesChipView[];
  activeSeriesId: string | null;
  freeroamActive: boolean;
  lang: UiLanguage;
  onPick(chip: SeriesChipView): void;
}

export const SeriesPicker = memo(function SeriesPicker({ chips, activeSeriesId, freeroamActive, lang, onPick }: SeriesPickerProps) {
  const t = useT();
  return (
    <div className="chips-scroll tr-series" id="tr-series" role="group" aria-label={t("tr.series")}>
      {chips.map((chip) => {
        const { series } = chip;
        const isFreeroam = series.special === "freeroam";
        const active = isFreeroam ? freeroamActive : !freeroamActive && series.id === activeSeriesId;
        const requirement = chip.unlocked
          ? null
          : isFreeroam
            ? t("tr.freeroamLocked")
            : `${t("tr.requiresSeries")}: ${chip.requires.map((g) => g.map((x) => gameName(x, lang)).join(` ${t("tr.or")} `)).join(" + ")}`;
        const classes = ["seg-chip"];
        if (active) classes.push("active");
        if (!chip.unlocked) classes.push("locked");
        return (
          <button
            key={series.id}
            type="button"
            className={classes.join(" ")}
            data-series={series.id}
            aria-pressed={active}
            aria-disabled={!chip.unlocked}
            title={requirement ?? (chip.completed ? t("tr.completed") : undefined)}
            onClick={() => {
              if (chip.unlocked) onPick(chip);
            }}
          >
            {!chip.unlocked ? <Lock className="seg-chip-ico" aria-hidden="true" /> : null}
            {chip.completed ? <Check className="seg-chip-ico" aria-hidden="true" /> : null}
            <span className="seg-chip-title">{gameName(series.title, lang)}</span>
            {requirement ? <small className="seg-chip-req">{requirement}</small> : null}
          </button>
        );
      })}
    </div>
  );
});

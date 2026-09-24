// "Meu time" na Home (F2.2; RF-40/RF-41/RF-123): 6 slots .slot (prototipo app.js:700-704). Ocupado = sprite + nome,
// clique abre a ficha e o "x" remove (com "Desfazer" por 4 s). Dex orfao aparece como vazio mas nao e apagado.
import { memo, useEffect, useMemo, useState } from "react";
import { Plus, X } from "../../components/Icon";
import type { SpeciesSummary } from "../../data/types";
import { gameName, useT } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useDatasetStore } from "../../state/dataset-store";
import { usePreferencesStore } from "../../state/preferences-store";
import { TOAST_DURATION_MS } from "../../state/shell-store";
import { useTeamHydrated, useTeamStore } from "../../state/team-store";
import { SpeciesSprite } from "./SpeciesSprite";

export function useSpeciesByDex(): ReadonlyMap<number, SpeciesSummary> {
  const index = useDatasetStore((s) => s.speciesIndex);
  return useMemo(() => new Map((index ?? []).map((s) => [s.dex, s])), [index]);
}

export const TeamSlots = memo(function TeamSlots() {
  const t = useT();
  const { navigate } = useNavigationActions();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  useTeamHydrated();
  const slots = useTeamStore((s) => s.slots);
  const byDex = useSpeciesByDex();
  const [undo, setUndo] = useState<{ name: string; slots: (number | null)[] } | null>(null);

  useEffect(() => {
    if (!undo) return undefined;
    const timer = setTimeout(() => setUndo(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [undo]);

  const occupied = slots.filter((s) => s !== null).length;

  const remove = async (s: SpeciesSummary) => {
    const previous = await useTeamStore.getState().removeFromTeam(s.dex);
    setUndo({ name: gameName(s, lang), slots: previous });
  };

  return (
    <div className="card card-team">
      <div className="card-head">
        <h3>{t("home.team")}</h3>
        <span className="pill team-count">{`${occupied}/${slots.length}`}</span>
      </div>
      <div className="team-slots" id="team-slots">
        {slots.map((dex, i) => {
          const species = dex === null ? undefined : byDex.get(dex);
          if (!species) {
            return (
              <div key={`empty-${i}`} className="slot" title={t("home.empty")} data-slot={i}>
                <span className="slot-plus" aria-hidden="true">
                  <Plus />
                </span>
              </div>
            );
          }
          const name = gameName(species, lang);
          return (
            <div
              key={`dex-${species.dex}`}
              className={`slot filled t-${species.types[0] ?? "normal"}`}
              data-slot={i}
              data-dex={species.dex}
            >
              <button type="button" className="slot-open" data-nav="" title={name} onClick={() => navigate("detail", { dex: species.dex })}>
                <SpeciesSprite species={species} />
                <span className="slot-name">{name}</span>
              </button>
              <button
                type="button"
                className="slot-remove"
                aria-label={t("home.removeFromTeam", { name })}
                title={t("home.removeFromTeam", { name })}
                onClick={() => void remove(species)}
              >
                <X />
              </button>
            </div>
          );
        })}
      </div>
      {undo ? (
        <div className="team-undo" role="status">
          <span className="team-undo-text">{t("home.removed", { name: undo.name })}</span>
          <button
            type="button"
            className="link team-undo-btn"
            onClick={() => {
              void useTeamStore.getState().setSlots(undo.slots);
              setUndo(null);
            }}
          >
            {t("home.undo")}
          </button>
        </div>
      ) : null}
    </div>
  );
});

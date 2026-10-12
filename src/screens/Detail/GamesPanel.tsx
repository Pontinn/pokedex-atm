// Painel "Jogos" (pokemon-generation, UISPEC secao 4): jogos principais em que a especie consta, pelo catalogo do
// manifest (ordem cronologica) e pelos ids da propria ficha (SpeciesDetail.games). Estados: catalogo ausente =
// painel nao renderiza; null = "So no pack"; [] = "Nao aparece nos jogos oficiais"; senao lista + nota da National Dex.
import { memo, useMemo, type CSSProperties } from "react";
import type { GameInfo, SpeciesDetail } from "../../data/types";
import { useT } from "../../i18n/useT";
import { useDatasetStore } from "../../state/dataset-store";

/** Jogos da especie na ordem do catalogo; id fora do catalogo e ignorado. */
export function gamesOf(ids: readonly number[] | null, catalog: readonly GameInfo[]): GameInfo[] {
  return ids === null ? [] : catalog.filter((g) => ids.includes(g.id));
}

export const GamesPanel = memo(function GamesPanel({ detail }: { detail: SpeciesDetail }) {
  const t = useT();
  const catalog = useDatasetStore((s) => s.manifest?.games ?? null);
  const list = useMemo(() => (catalog ? gamesOf(detail.games, catalog) : []), [catalog, detail.games]);
  if (catalog === null) return null;
  return (
    <div className="panel games-panel" id="games-panel" style={{ "--i": 7 } as CSSProperties}>
      <div className="panel-head">
        <h3>{t("detail.games")}</h3>
      </div>
      {detail.games === null ? (
        <p className="muted games-empty" data-games="pack">
          {t("games.packOnly")}
        </p>
      ) : list.length === 0 ? (
        <p className="muted games-empty" data-games="none">
          {t("games.none")}
        </p>
      ) : (
        <>
          <div className="kv">
            <span className="k" id="games-available">
              {t("games.availableIn")}
            </span>
            <ul className="chips games-list" aria-labelledby="games-available">
              {list.map((g) => (
                <li key={g.id} className="game-chip" data-game={g.slug}>
                  {g.name}
                </li>
              ))}
            </ul>
          </div>
          <p className="games-note">{t("games.note")}</p>
        </>
      )}
    </div>
  );
});

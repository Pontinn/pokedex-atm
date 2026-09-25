// Tela Pokedex (F3): cabecalho com contagem + grade virtualizada (F3.1). Porta design/prototipo/index.html:115-150.
import "./dex.css";
import { useMemo } from "react";
import { EmptyState } from "../../components/EmptyState";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import type { ScreenProps } from "../../components/ScreenRouter";
import { useT } from "../../i18n/useT";
import { useCapturedHydrated } from "../../state/captured-store";
import { useDatasetStore } from "../../state/dataset-store";
import { DexGrid } from "./DexGrid";

export function DexScreen(_props: ScreenProps) {
  const t = useT();
  useCapturedHydrated();
  const index = useDatasetStore((s) => s.speciesIndex);
  const list = useMemo(() => (index ? [...index].sort((a, b) => a.dex - b.dex) : null), [index]);
  return (
    <section className="dex-screen" data-screen-root="dex">
      <div className="page-head">
        <h2>{t("nav.dex")}</h2>
        <span className="muted dex-count">
          <span id="dex-count">{list ? list.length : 0}</span> {t("dex.results")}
        </span>
      </div>
      {!list ? (
        <div className="dex-loading">
          <PokeballSpinner />
        </div>
      ) : list.length === 0 ? (
        <EmptyState messageKey="dex.none" />
      ) : (
        <DexGrid list={list} />
      )}
    </section>
  );
}

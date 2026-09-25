// Tela Pokedex (F3): busca PT/EN + filtros combinaveis (F3.2) + grade virtualizada (F3.1). Porta
// design/prototipo/index.html:115-150. A tela nao le filtros: so DexCount e DexResults re-renderizam ao filtrar
// (RF-04); `data-mount-id` prova que trocar filtro nao remonta a tela.
import "./dex.css";
import { memo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import type { ScreenProps } from "../../components/ScreenRouter";
import { useT } from "../../i18n/useT";
import { useNavigationStore } from "../../navigation/navigation-store";
import type { DexFilters as DexFiltersState } from "../../navigation/types";
import { useCapturedHydrated } from "../../state/captured-store";
import { usePreferencesStore } from "../../state/preferences-store";
import { DexFilters, DexSearch } from "./DexFilters";
import { DexGrid } from "./DexGrid";
import { useFilteredSpecies } from "./use-filtered-species";

let mountSeq = 0;

const DexCount = memo(function DexCount() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const list = useFilteredSpecies(lang);
  return (
    <span className="muted dex-count">
      <span id="dex-count">{list ? list.length : 0}</span> {t("dex.results")}
    </span>
  );
});

const DexResults = memo(function DexResults() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const list = useFilteredSpecies(lang);
  const query = useNavigationStore((s) => ((s.current.ui as { filters?: DexFiltersState }).filters?.query ?? "").trim());
  if (!list) {
    return (
      <div className="dex-loading">
        <PokeballSpinner />
      </div>
    );
  }
  if (list.length === 0) {
    return (
      <EmptyState messageKey="dex.none">
        {query ? <p className="dex-empty-query">{t("dex.noneQuery", { q: query })}</p> : null}
      </EmptyState>
    );
  }
  return <DexGrid list={list} />;
});

export function DexScreen(_props: ScreenProps) {
  const t = useT();
  useCapturedHydrated();
  const [mountId] = useState(() => ++mountSeq);
  return (
    <section className="dex-screen" data-mount-id={mountId}>
      <div className="page-head">
        <h2>{t("nav.dex")}</h2>
        <DexCount />
      </div>
      <DexSearch />
      <DexFilters />
      <DexResults />
    </section>
  );
}

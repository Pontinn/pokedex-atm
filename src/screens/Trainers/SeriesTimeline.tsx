// Serie ativa (F8.2): cabecalho do cap + busca + linha do tempo dos treinadores-chave.
// O cap/proximo/derrotados usam a serie inteira; so TrainerList le a busca (RF-04: so a lista re-renderiza).
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { InlineError } from "../../components/InlineError";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import { playSfx } from "../../audio/sfx";
import type { BiomeLabels, ItemsFile, LevelCapConfig, SeriesInfo, SpeciesSummary, TrainerInfo } from "../../data/types";
import { loadBiomes, loadItems, loadTrainers } from "../../data/loaders";
import { computeSeriesCap, defeatedSet } from "../../domain/level-cap";
import { useNavigationStore } from "../../navigation/navigation-store";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useDatasetStore } from "../../state/dataset-store";
import { useTermsLanguage, usePreferencesStore } from "../../state/preferences-store";
import { useTrainersStore } from "../../state/trainers-store";
import { CapHeader } from "./CapHeader";
import { ListSearch, useListQuery } from "./ListSearch";
import { TrainerStep } from "./TrainerStep";
import { buildSeriesView, filterTrainers, keyTrainersOf, type SeriesView } from "./trainer-model";
import { useLoader } from "./use-loader";

const loadExtras = () => Promise.all([loadItems(), loadBiomes()]);

function useSpeciesByDex(): ReadonlyMap<number, SpeciesSummary> {
  const index = useDatasetStore((s) => s.speciesIndex);
  return useMemo(() => new Map((index ?? []).map((s) => [s.dex, s])), [index]);
}

interface TrainerListProps {
  series: SeriesInfo;
  keyTrainers: readonly TrainerInfo[];
  trainersById: ReadonlyMap<string, TrainerInfo>;
  view: SeriesView;
  defeated: ReadonlySet<string>;
  items: ItemsFile | null;
  biomes: BiomeLabels | null;
  onToggleDefeated(id: string, defeated: boolean): void;
}

const TrainerList = memo(function TrainerList(p: TrainerListProps) {
  const query = useListQuery("trainers");
  const speciesByDex = useSpeciesByDex();
  const lang = useTermsLanguage("trainers");
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const openId = useScreenUi("trainers", "openTrainerId");
  const { updateUi } = useNavigationActions();
  const onToggleOpen = useCallback(
    (id: string) => {
      updateUi<"trainers">({ openTrainerId: openId === id ? null : id });
    },
    [openId, updateUi],
  );
  const shown = useMemo(() => filterTrainers(p.keyTrainers, query, speciesByDex), [p.keyTrainers, query, speciesByDex]);
  // Entrada nova com um treinador ja aberto (link da pagina do item): rola ate ele; o Voltar restaura o scroll salvo.
  const [fresh] = useState(() => useNavigationStore.getState().restoredScroll === null);
  const [initialOpen] = useState(openId);
  useEffect(() => {
    if (!fresh || initialOpen === null) return;
    const el = [...document.querySelectorAll<HTMLElement>(".tr-list [data-trainer]")].find((n) => n.dataset.trainer === initialOpen);
    el?.scrollIntoView?.({ block: "center" });
  }, [fresh, initialOpen]);
  if (shown.length === 0) {
    return (
      <EmptyState messageKey="tr.searchNone">
        <p className="empty-query">{`"${query.trim()}"`}</p>
      </EmptyState>
    );
  }
  return (
    <div className="tr-list" id="tr-list">
      {shown.map((tr, i) => (
        <TrainerStep
          key={tr.id}
          trainer={tr}
          index={i}
          state={p.view.states.get(tr.id) ?? "locked"}
          blocked={p.view.blocked.has(tr.id)}
          level={p.view.levels.get(tr.id) ?? 0}
          open={openId === tr.id}
          defeated={p.defeated.has(tr.id)}
          trainersById={p.trainersById}
          speciesByDex={speciesByDex}
          items={p.items}
          biomes={p.biomes}
          lang={lang}
          uiLang={uiLang}
          onToggleOpen={onToggleOpen}
          onToggleDefeated={p.onToggleDefeated}
        />
      ))}
    </div>
  );
});

export function SeriesTimeline({ series, config }: { series: SeriesInfo; config: LevelCapConfig }) {
  const trainers = useLoader(() => loadTrainers(series.id), [series.id]);
  const extras = useLoader(loadExtras, []);
  const progress = useTrainersStore((s) => s.progress);
  const defeated = useMemo(() => defeatedSet(progress), [progress]);

  const all = trainers.data?.trainers ?? null;
  const keyTrainers = useMemo(() => (all ? keyTrainersOf(series, all) : []), [all, series]);
  const trainersById = useMemo(() => new Map((all ?? []).map((tr) => [tr.id, tr])), [all]);
  const view = useMemo(() => (all ? buildSeriesView(keyTrainers, all, defeated, config) : null), [all, keyTrainers, defeated, config]);

  const onToggleDefeated = useCallback(
    (id: string, checked: boolean) => {
      if (!all) return;
      const store = useTrainersStore.getState();
      const before = computeSeriesCap({ keyTrainers, allTrainers: all, defeated: defeatedSet(store.progress), config, mode: "series" }).cap;
      const done = checked ? store.markDefeated(series.id, id) : store.unmarkDefeated(series.id, id);
      void done.then(() => {
        const after = computeSeriesCap({
          keyTrainers,
          allTrainers: all,
          defeated: defeatedSet(useTrainersStore.getState().progress),
          config,
          mode: "series",
        }).cap;
        if (after > before) playSfx("levelup");
      });
    },
    [all, keyTrainers, config, series.id],
  );

  if (trainers.error) return <InlineError onRetry={trainers.retry} />;
  if (!view) return <PokeballSpinner />;
  return (
    <>
      <CapHeader
        cap={view.cap.cap}
        defeated={view.defeatedCount}
        total={keyTrainers.length}
        nextNames={view.cap.available.map((tr) => tr.name)}
      />
      <div className="tr-search">
        <ListSearch screen="trainers" id="tr-q" labelKey="tr.searchLabel" placeholderKey="tr.searchPh" clearKey="tr.searchClear" />
      </div>
      <TrainerList
        series={series}
        keyTrainers={keyTrainers}
        trainersById={trainersById}
        view={view}
        defeated={defeated}
        items={extras.data?.[0] ?? null}
        biomes={extras.data?.[1] ?? null}
        onToggleDefeated={onToggleDefeated}
      />
    </>
  );
}

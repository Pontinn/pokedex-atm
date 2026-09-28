// Tela Treinadores (F8; porta renderTrainers, app.js:1122-1130). Picker de series com bloqueio e Modo Livre
// (F8.1), cap vigente e linha do tempo dos treinadores-chave com derrotados e busca PT/EN (F8.2).
import "./trainers.css";
import { useCallback, useEffect, useMemo } from "react";
import type { ScreenProps } from "../../components/ScreenRouter";
import { Info } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import { TermsToggle } from "../../components/TermsToggle";
import { loadSeries } from "../../data/loaders";
import { defeatedSet } from "../../domain/level-cap";
import { useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useDatasetStore } from "../../state/dataset-store";
import { usePreferencesStore } from "../../state/preferences-store";
import { useShellStore } from "../../state/shell-store";
import { useTrainersHydrated, useTrainersStore } from "../../state/trainers-store";
import { SeriesPicker } from "./SeriesPicker";
import { SeriesTimeline } from "./SeriesTimeline";
import { orderSeries, seriesChips, type SeriesChipView } from "./trainer-model";
import { useLoader } from "./use-loader";

const FREEROAM_CAP = 100;

function SeriesArea() {
  const t = useT();
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const config = useDatasetStore((s) => s.manifest?.levelCapConfig ?? null);
  const hydrated = useTrainersHydrated();
  const series = useLoader(loadSeries, []);
  const progress = useTrainersStore((s) => s.progress);
  const defeated = useMemo(() => defeatedSet(progress), [progress]);
  const ordered = useMemo(() => (series.data ? orderSeries(series.data) : null), [series.data]);
  const chips = useMemo(
    () => (ordered && config ? seriesChips(ordered, defeated, config) : []),
    [ordered, defeated, config],
  );

  // Serie ativa salva que sumiu do dataset: volta a "nenhuma" com aviso (o progresso orfao continua salvo).
  const activeId = progress.activeSeriesId;
  // Serie aberta por link (ex. Drop de treinador na pagina do item): so visualiza, nao muda a serie ativa.
  const viewId = useScreenUi("trainers", "seriesId");
  const { updateUi } = useNavigationActions();
  useEffect(() => {
    if (!hydrated || !series.data || activeId === null) return;
    if (!series.data.some((s) => s.id === activeId && s.special === null)) {
      void useTrainersStore.getState().setActiveSeries(null);
      useShellStore.getState().pushToast("tr.seriesGone", { tone: "info" });
    }
  }, [hydrated, series.data, activeId]);

  const onPick = useCallback((chip: SeriesChipView) => {
    updateUi<"trainers">({ seriesId: null });
    const store = useTrainersStore.getState();
    if (chip.series.special === "freeroam") {
      void (store.progress.freeroam.active ? store.leaveFreeroam() : store.enterFreeroam());
    } else void store.setActiveSeries(chip.series.id);
  }, [updateUi]);

  if (series.error) return <InlineError onRetry={series.retry} />;
  if (!ordered || !config || !hydrated) return <PokeballSpinner />;
  const active = progress.freeroam.active ? null : (ordered.find((s) => s.id === activeId && s.special === null) ?? null);
  const viewed = viewId !== null && viewId !== active?.id ? (ordered.find((s) => s.id === viewId && s.special === null) ?? null) : null;
  return (
    <>
      <div className="tr-top">
        <div className="tr-tools">
          <div className="filter-group">
            <label htmlFor="tr-series">{t("tr.series")}</label>
            <SeriesPicker chips={chips} activeSeriesId={activeId} freeroamActive={progress.freeroam.active} lang={uiLang} onPick={onPick} />
          </div>
          <TermsToggle cardKey="trainers" />
        </div>
        <div className="notice notice-info">
          <Info aria-hidden="true" />
          <div>{t("tr.explain")}</div>
        </div>
      </div>
      {viewed ? (
        <>
          <div className="notice notice-info tr-viewing" role="status" data-viewing={viewed.id}>
            <Info aria-hidden="true" />
            <div>
              {t("tr.viewing", { name: viewed.title[uiLang] || viewed.title.en })}{" "}
              <button type="button" className="tr-viewing-back" onClick={() => updateUi<"trainers">({ seriesId: null, openTrainerId: null })}>
                {t("tr.viewingBack")}
              </button>
            </div>
          </div>
          <SeriesTimeline key={viewed.id} series={viewed} config={config} />
        </>
      ) : progress.freeroam.active ? (
        <div className="card tr-headcard" id="tr-header" data-mode="freeroam">
          <h3>{t("tr.progress")}</h3>
          <div className="tr-cap">
            <span className="tr-cap-k">{t("tr.currentCap")}</span>
            <span className="tr-cap-v" data-testid="tr-cap">
              {FREEROAM_CAP}
            </span>
          </div>
          <p className="muted tr-mode-note">{t("tr.freeroamActive")}</p>
        </div>
      ) : active ? (
        <SeriesTimeline key={active.id} series={active} config={config} />
      ) : (
        <div className="notice tr-choose" role="status">
          <Info aria-hidden="true" />
          <div>{t("tr.chooseSeries")}</div>
        </div>
      )}
    </>
  );
}

export function TrainersScreen(_props: ScreenProps) {
  const t = useT();
  return (
    <div className="trainers-screen">
      <div className="page-head">
        <h2>{t("nav.trainers")}</h2>
        <span className="muted tr-source">{t("tr.source")}</span>
      </div>
      <SeriesArea />
    </div>
  );
}

// Tela Capturados (F6.2; porta renderCaptured app.js:1013-1016, index.html:157-175, style.css:664-667, 422).
// Cabecalho .captured-summary (pokebola wobble, "X de {counts.species}" com Intl.NumberFormat, barra), busca PT/EN no
// topo (mesmo ListSearch da Pokedex, texto em current.ui.filters.query) combinada (E) com as abas Todos capturados /
// So faltando (current.ui.tab), grade DexGrid virtualizada com "Capturado em {data}" e "Desmarcar" (Modal).
// Orfaos (dex fora do dataset atual) nao contam nem aparecem (RF-123). So o bloco da lista re-renderiza (RF-04).
import "./captured.css";
import { memo, useCallback, useMemo, useState } from "react";
import pokeballUrl from "../../assets/pokeball.webp";
import { EmptyState } from "../../components/EmptyState";
import { X } from "../../components/Icon";
import { Modal } from "../../components/Modal";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import type { ScreenProps } from "../../components/ScreenRouter";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { SpeciesSummary } from "../../data/types";
import { gameName, useT } from "../../i18n/useT";
import { useNavigationStore } from "../../navigation/navigation-store";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useCapturedHydrated, useCapturedKnownCount, useCapturedStore, type CapturedEntries } from "../../state/captured-store";
import { useDatasetStore } from "../../state/dataset-store";
import { usePreferencesStore } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { DexGrid } from "../Dex/DexGrid";
import { ListSearch } from "../Dex/ListSearch";
import { matchesQuery } from "../Dex/use-filtered-species";

export type CapturedTab = "all" | "missing";

/** "dd/mm/aaaa" (pt) ou "yyyy-mm-dd" (en), no fuso local (app.js:670). */
export function formatCaptureDate(ms: number, lang: UiLanguage): string {
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return lang === "en" ? `${yyyy}-${mm}-${dd}` : `${dd}/${mm}/${yyyy}`;
}

/**
 * Lista da aba: "all" = capturados conhecidos, mais recentes primeiro (desempate por numero); "missing" = especies do
 * dataset ainda nao capturadas, por numero. A busca (numero ou nome PT/EN sem acento) filtra as duas (E logico).
 */
export function capturedList(index: readonly SpeciesSummary[], entries: CapturedEntries, tab: CapturedTab, query: string): SpeciesSummary[] {
  if (tab === "missing") return index.filter((s) => !(String(s.dex) in entries) && matchesQuery(s, query)).sort((a, b) => a.dex - b.dex);
  return index
    .filter((s) => String(s.dex) in entries && matchesQuery(s, query))
    .sort((a, b) => entries[String(b.dex)]!.capturedAt - entries[String(a.dex)]!.capturedAt || a.dex - b.dex);
}

function patchQuery(query: string) {
  useNavigationStore.getState().updateUi<"captured">({ filters: { query } });
}

const CapturedSummary = memo(function CapturedSummary() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const total = useDatasetStore((s) => s.manifest?.counts.species ?? 0);
  const caught = useCapturedKnownCount();
  const locale = lang === "en" ? "en-US" : "pt-BR";
  const nf = new Intl.NumberFormat(locale);
  const ratio = total > 0 ? Math.min(caught / total, 1) : 0;
  const pct = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(ratio);
  return (
    <div className="card captured-summary" id="captured-summary">
      <div className="captured-ball">
        <img src={pokeballUrl} alt="" />
      </div>
      <div className="captured-info">
        <div className="summary-big">
          <strong className="summary-count" id="captured-count">
            {nf.format(caught)}
          </strong>
          <span className="summary-of">{` ${t("captured.of")} ${nf.format(total)}`}</span>
        </div>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={caught}>
          <div className="progress-bar" style={{ ["--p" as string]: `${ratio * 100}%` }} />
        </div>
        <div className="summary-foot">
          <span className="summary-pct">{t("captured.percent", { pct })}</span>
        </div>
      </div>
    </div>
  );
});

const CapturedTabs = memo(function CapturedTabs() {
  const t = useT();
  const tab = useScreenUi("captured", "tab") as CapturedTab;
  const { updateUi } = useNavigationActions();
  return (
    <SegmentedControl<CapturedTab>
      className="seg-tabs captured-tabs"
      ariaLabel={t("captured.tabs")}
      value={tab === "missing" ? "missing" : "all"}
      onChange={(v) => updateUi<"captured">({ tab: v })}
      options={[
        { value: "all", label: t("captured.tabAll") },
        { value: "missing", label: t("captured.tabMissing") },
      ]}
    />
  );
});

const CapturedSearch = memo(function CapturedSearch() {
  const initial = useNavigationStore((s) => (s.current.ui as { filters?: { query?: string } }).filters?.query ?? "");
  return (
    <ListSearch id="captured-search" initial={initial} onQuery={patchQuery} placeholderKey="captured.searchPh" labelKey="captured.searchLabel" />
  );
});

function CaughtFooter({ species, capturedAt, onUnmark }: { species: SpeciesSummary; capturedAt: number; onUnmark(s: SpeciesSummary): void }) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  return (
    <>
      <span className="caught-date">{`${t("captured.on")} ${formatCaptureDate(capturedAt, lang)}`}</span>
      <button
        type="button"
        className="caught-unmark"
        data-unmark={species.dex}
        aria-label={`${t("captured.unmark")} ${gameName(species, lang)}`}
        title={t("captured.unmark")}
        onClick={() => onUnmark(species)}
      >
        <X />
      </button>
    </>
  );
}

const CapturedResults = memo(function CapturedResults() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const index = useDatasetStore((s) => s.speciesIndex);
  const hydrated = useCapturedHydrated();
  const entries = useCapturedStore((s) => s.entries);
  const tab = (useScreenUi("captured", "tab") === "missing" ? "missing" : "all") as CapturedTab;
  const query = useNavigationStore((s) => ((s.current.ui as { filters?: { query?: string } }).filters?.query ?? "").trim());
  const { go } = useNavigationActions();
  const [pending, setPending] = useState<SpeciesSummary | null>(null);
  const list = useMemo(() => (index ? capturedList(index, entries, tab, query) : null), [index, entries, tab, query]);
  const onUnmark = useCallback((s: SpeciesSummary) => setPending(s), []);
  const renderFooter = useCallback(
    (s: SpeciesSummary) => {
      const e = entries[String(s.dex)];
      return e ? <CaughtFooter species={s} capturedAt={e.capturedAt} onUnmark={onUnmark} /> : null;
    },
    [entries, onUnmark],
  );

  if (!list || !hydrated) {
    return (
      <div className="dex-loading">
        <PokeballSpinner />
      </div>
    );
  }
  let empty = null;
  if (list.length === 0) {
    if (query) {
      empty = (
        <EmptyState messageKey="captured.noneQuery">
          <p className="captured-empty-query">{`"${query}"`}</p>
        </EmptyState>
      );
    } else if (tab === "missing") {
      empty = <EmptyState messageKey="captured.complete" />;
    } else {
      empty = (
        <EmptyState messageKey="captured.none">
          <button type="button" className="btn btn-primary captured-open-dex" data-nav="" onClick={() => go("dex")}>
            {t("captured.openDex")}
          </button>
        </EmptyState>
      );
    }
  }
  return (
    <>
      <div className="captured-results" data-tab={tab} data-count={list.length}>
        {empty ?? <DexGrid list={list} renderFooter={tab === "all" ? renderFooter : undefined} />}
      </div>
      <Modal open={pending !== null} onClose={() => setPending(null)} title={t("detail.unmarkTitle")}>
        <p className="modal-text">{t("detail.unmarkBody", { name: pending ? gameName(pending, lang) : "" })}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setPending(null)}>
            {t("detail.cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            id="btn-unmark-confirm"
            onClick={() => {
              const dex = pending?.dex;
              setPending(null);
              if (dex !== undefined) void useCapturedStore.getState().unmark(dex);
            }}
          >
            {t("detail.unmark")}
          </button>
        </div>
      </Modal>
    </>
  );
});

export function CapturedScreen(_props: ScreenProps) {
  const t = useT();
  useCapturedHydrated();
  return (
    <section className="captured-screen">
      <div className="page-head">
        <h2>{t("nav.captured")}</h2>
      </div>
      <CapturedSummary />
      <CapturedSearch />
      <CapturedTabs />
      <CapturedResults />
    </section>
  );
}

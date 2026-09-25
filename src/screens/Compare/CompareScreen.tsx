// Tela Comparar (F7.1; porta renderCompare, app.js:1018-1036, style.css:670-684 e 860-867): dois lados com artwork,
// numero, nome, tipos e "Trocar Pokémon" (ComparePicker, mesma busca da Home); linhas de stat espelhadas, maior valor
// em verde (.win) e Total; "Trocar lados" inverte current.ui.left/right sem navegar (o scroll fica).
// Padrao: os 2 ultimos do historico (useHistoryStore), senao vazio.
import "./compare.css";
import { memo, useEffect, useState, type CSSProperties } from "react";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ArrowLeftRight } from "../../components/Icon";
import { EmptyState } from "../../components/EmptyState";
import { InlineError } from "../../components/InlineError";
import { Skeleton } from "../../components/Skeleton";
import { TypeChip } from "../../components/TypeChip";
import type { BaseStats, SpeciesDetail } from "../../data/types";
import { gameName, useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useHistoryHydrated, useHistoryStore } from "../../state/history-store";
import { usePreferencesStore, useTermsLanguage } from "../../state/preferences-store";
import { ArtworkImage } from "../Detail/ArtworkImage";
import { STAT_ROWS, statTotal } from "../Detail/StatsPanel";
import { useSpeciesDetail } from "../Detail/use-species-detail";
import { formatDex } from "../Home/SpeciesSprite";
import { ComparePicker } from "./ComparePicker";
import { compareDefaults, winner, type Side } from "./compare-model";

const CompareSide = memo(function CompareSide({ side, dex }: { side: Side; dex: number | null }) {
  const t = useT();
  const { updateUi } = useNavigationActions();
  const lang = useTermsLanguage("compare");
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const [picking, setPicking] = useState(false);
  const state = useSpeciesDetail(dex ?? 0);
  const pick = (d: number) => {
    setPicking(false);
    updateUi<"compare">({ [side]: d });
  };
  const change = (
    <button type="button" className="link cmp-change" aria-expanded={picking} onClick={() => setPicking((v) => !v)}>
      {t("compare.change")}
    </button>
  );
  let body;
  if (dex == null || state.status === "notFound") {
    body = (
      <div className="cmp-empty">
        <EmptyState messageKey="compare.pick" />
        {change}
      </div>
    );
  } else if (state.status === "error") {
    body = <InlineError onRetry={state.retry} />;
  } else if (state.status === "loading") {
    body = <Skeleton className="cmp-skel" width="100%" height={96} />;
  } else {
    const d = state.detail;
    body = (
      <>
        <ArtworkImage artworkId={d.artworkId} size={96} showNotice={false} className="cmp-art" />
        <div className="cmp-info">
          <div className="dex-num">{formatDex(d.dex)}</div>
          <h3>{gameName(d, lang)}</h3>
          <div className="types">
            {d.types.map((ty) => (
              <TypeChip key={ty} type={ty} lang={uiLang} size="sm" />
            ))}
          </div>
          {change}
        </div>
      </>
    );
  }
  return (
    <div className={`card cmp-poke ${side}`} data-side={side} data-dex={dex ?? ""}>
      {body}
      {picking ? <ComparePicker side={side} onPick={pick} onClose={() => setPicking(false)} /> : null}
    </div>
  );
});

function StatRow({ label, a, b, wa, wb, colorA, colorB, index, total }: { label: string; a: number | null; b: number | null; wa: number; wb: number; colorA: string; colorB: string; index: number; total?: boolean }) {
  const win = winner(a, b);
  const bar = (w: number, color: string, left: boolean) => (
    <div className={`cmp-bar${left ? " left" : ""}`}>
      <i style={{ "--w": `${w}%`, "--bc": color, "--d": `${total ? 500 : index * 70}ms` } as CSSProperties} />
    </div>
  );
  return (
    <div className={`cmp-row${total ? " cmp-total" : ""}`} data-stat={label}>
      <span className={`v${win === "left" ? " win" : ""}`}>{a ?? "-"}</span>
      {bar(wa, colorA, true)}
      <span className="lbl">{label}</span>
      {bar(wb, colorB, false)}
      <span className={`v r${win === "right" ? " win" : ""}`}>{b ?? "-"}</span>
    </div>
  );
}

function useSideDetail(dex: number | null): SpeciesDetail | null {
  const s = useSpeciesDetail(dex ?? 0);
  return dex != null && s.status === "ready" ? s.detail : null;
}

const CompareStats = memo(function CompareStats({ left, right }: { left: number | null; right: number | null }) {
  const t = useT();
  const { updateUi } = useNavigationActions();
  const a = useSideDetail(left);
  const b = useSideDetail(right);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGo(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const colorA = a ? `var(--t-${a.types[0]})` : "var(--muted)";
  const colorB = b ? `var(--t-${b.types[0]})` : "var(--muted)";
  const val = (d: SpeciesDetail | null, k: keyof BaseStats) => (d ? d.baseStats[k] : null);
  const ta = a ? statTotal(a.baseStats) : null;
  const tb = b ? statTotal(b.baseStats) : null;
  return (
    <div className="panel cmp-panel">
      <div className={`cmp-stats${go ? " go" : ""}`}>
        {STAT_ROWS.map((r, i) => {
          const va = val(a, r.key);
          const vb = val(b, r.key);
          return <StatRow key={r.key} label={t(r.label)} a={va} b={vb} wa={Math.min(100, (va ?? 0) / 2)} wb={Math.min(100, (vb ?? 0) / 2)} colorA={colorA} colorB={colorB} index={i} />;
        })}
        <StatRow label={t("compare.total")} a={ta} b={tb} wa={Math.min(100, (ta ?? 0) / 8)} wb={Math.min(100, (tb ?? 0) / 8)} colorA={colorA} colorB={colorB} index={6} total />
      </div>
      <div className="cmp-actions">
        <button type="button" className="btn btn-ghost" id="cmp-swap" onClick={() => updateUi<"compare">({ left: right, right: left })}>
          <ArrowLeftRight aria-hidden="true" />
          {t("compare.swap")}
        </button>
      </div>
    </div>
  );
});

export function CompareScreen({ params }: ScreenProps) {
  const t = useT();
  const { updateUi } = useNavigationActions();
  const left = useScreenUi("compare", "left");
  const right = useScreenUi("compare", "right");
  const historyReady = useHistoryHydrated();
  const [seeded, setSeeded] = useState(left != null || right != null);

  useEffect(() => {
    if (seeded || !historyReady) return;
    setSeeded(true);
    const next = compareDefaults(params as { left?: number; right?: number }, useHistoryStore.getState().entries);
    if (next.left != null || next.right != null) updateUi<"compare">(next);
  }, [seeded, historyReady, params, updateUi]);

  return (
    <div className="compare-screen">
      <div className="page-head">
        <h2>{t("nav.compare")}</h2>
      </div>
      <div className="compare">
        <div className="cmp-pick">
          <CompareSide side="left" dex={left} />
          <div className="cmp-vs" aria-hidden="true">
            {t("compare.vs")}
          </div>
          <CompareSide side="right" dex={right} />
        </div>
        <CompareStats left={left} right={right} />
      </div>
    </div>
  );
}

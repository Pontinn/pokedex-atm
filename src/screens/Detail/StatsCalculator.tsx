// Calculadoras da ficha (F5.4; porta renderCalc app.js:1002-1008 e <details class="calc"> 984-995, style.css:649-661):
// IV (0-31) e EV (0-252, soma <= 510) por stat, nivel 1-100, natureza (25, com +/-); saida no nivel escolhido e no 100
// (calculateStats, B6.2) com up/down coloridos; "Recomendacao" por funcao (recommendedInvestment, RF-110 rev 7: funcao, 2 stats, natureza, aviso de IA, sem numeros) com botao Aplicar (nunca
// substitui sozinho, RF-110). Estado dos inputs e "aberto" em current.ui.calcInputs/calcOpen (RF-01). A calculadora
// de efetividade (TypeCalculator) fica no mesmo <details>.
import { memo, useMemo, useRef, type CSSProperties } from "react";
import { ChevronDown } from "../../components/Icon";
import type { BaseStats } from "../../data/types";
import { NATURES, type BattleStatKey, type StatKey } from "../../domain/natures";
import { calculateStats, MAX_EV, MAX_EV_TOTAL, MAX_IV, recommendedInvestment, STAT_KEYS } from "../../domain/stats";
import { useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useNavigationStore } from "../../navigation/navigation-store";
import { useTermsLanguage } from "../../state/preferences-store";
import { STAT_ROWS } from "./StatsPanel";
import { TypeCalculator } from "./TypeCalculator";

export const DEFAULT_LEVEL = 50;
type CalcInputs = Record<string, number | string>;

const STAT_LABEL: Record<StatKey, string> = Object.fromEntries(STAT_ROWS.map((r) => [r.key, r.label])) as Record<StatKey, string>;

/** Numero inteiro com clamp; texto nao numerico -> `fallback`. */
export function clampInt(raw: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return Math.min(Math.max(fallback, min), max);
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export interface CalcState {
  level: number;
  nature: string;
  ivs: BaseStats;
  evs: BaseStats;
  evTotal: number;
}

export function readCalcState(inputs: CalcInputs): CalcState {
  const ivs = {} as BaseStats;
  const evs = {} as BaseStats;
  for (const k of STAT_KEYS) {
    ivs[k] = clampInt(inputs[`iv.${k}`] ?? MAX_IV, 0, MAX_IV);
    evs[k] = clampInt(inputs[`ev.${k}`] ?? 0, 0, MAX_EV);
  }
  const nature = typeof inputs.nature === "string" && NATURES.some((n) => n.id === inputs.nature) ? inputs.nature : "hardy";
  return {
    level: clampInt(inputs.level ?? DEFAULT_LEVEL, 1, 100, 1),
    nature,
    ivs,
    evs,
    evTotal: STAT_KEYS.reduce((s, k) => s + evs[k], 0),
  };
}

function useCalcInputs(): CalcInputs {
  return useScreenUi("detail", "calcInputs");
}

function setInputs(patch: CalcInputs) {
  const current = useNavigationStore.getState().current.ui as { calcInputs?: CalcInputs };
  useNavigationStore.getState().updateUi<"detail">({ calcInputs: { ...(current.calcInputs ?? {}), ...patch } });
}

const StatInputs = memo(function StatInputs({ state }: { state: CalcState }) {
  const t = useT();
  const over = state.evTotal > MAX_EV_TOTAL;
  return (
    <div className="calc-stats">
      <div className="calc-stats-head">
        <span />
        <span>{t("calc.iv")}</span>
        <span>{t("calc.ev")}</span>
      </div>
      {STAT_KEYS.map((k) => (
        <div className="calc-stat-row" key={k} data-stat={k}>
          <span className="calc-stat-name">{t(STAT_LABEL[k] as never)}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_IV}
            step={1}
            aria-label={`${t("calc.iv")} ${t(STAT_LABEL[k] as never)}`}
            data-iv={k}
            value={state.ivs[k]}
            onChange={(e) => setInputs({ [`iv.${k}`]: clampInt(e.target.value, 0, MAX_IV) })}
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_EV}
            step={4}
            aria-label={`${t("calc.ev")} ${t(STAT_LABEL[k] as never)}`}
            data-ev={k}
            className={over ? "invalid" : undefined}
            aria-invalid={over || undefined}
            value={state.evs[k]}
            onChange={(e) => setInputs({ [`ev.${k}`]: clampInt(e.target.value, 0, MAX_EV) })}
          />
        </div>
      ))}
      <div className={`calc-ev-total${over ? " invalid" : ""}`} role={over ? "alert" : undefined}>
        {t(over ? "calc.evOver" : "calc.evTotal", { n: state.evTotal, max: MAX_EV_TOTAL })}
      </div>
    </div>
  );
});

const CalcOutput = memo(function CalcOutput({ baseStats, state }: { baseStats: BaseStats; state: CalcState }) {
  const t = useT();
  const nature = NATURES.find((n) => n.id === state.nature) ?? NATURES[0]!;
  const valid = state.evTotal <= MAX_EV_TOTAL;
  const last = useRef<ReturnType<typeof calculateStats> | null>(null);
  if (valid) last.current = calculateStats(baseStats, state.level, state.ivs, state.evs, state.nature);
  const out = last.current;
  return (
    <div className={`calc-out${valid ? "" : " stale"}`} id="calc-out">
      {STAT_KEYS.map((k) => {
        const cls = nature.up === k ? "up" : nature.down === k ? "down" : "";
        return (
          <div className={`co ${cls}`.trim()} key={k} data-stat={k}>
            <b>{out ? out.atLevel[k] : "-"}</b>
            <span>{t(STAT_LABEL[k] as never)}</span>
            <small>{t("calc.at100", { n: out ? out.atLevel100[k] : "-" })}</small>
          </div>
        );
      })}
    </div>
  );
});

function natureLabel(n: (typeof NATURES)[number], lang: "pt" | "en", t: ReturnType<typeof useT>): string {
  const main = n.name[lang] || n.name.en;
  if (!n.up || !n.down) return `${main} (${t("calc.neutral")})`;
  const s = (k: BattleStatKey) => t(STAT_LABEL[k] as never);
  return `${main} (+${s(n.up)} -${s(n.down)})`;
}

const Recommendation = memo(function Recommendation({ baseStats, lang }: { baseStats: BaseStats; lang: "pt" | "en" }) {
  const t = useT();
  const rec = useMemo(() => recommendedInvestment(baseStats), [baseStats]);
  const [a, b] = rec.highlight;
  const stat = (k: StatKey) => t(STAT_LABEL[k] as never);
  const nature = NATURES.find((n) => n.id === rec.natureId) ?? NATURES[0]!;
  return (
    <div className="calc-rec" id="calc-rec" data-role={rec.role}>
      <div className="calc-rec-text">
        <b className="calc-rec-role">{t(`calc.role.${rec.role}`)}</b>
        <span className="calc-rec-line">{t("calc.prioritize", { a: stat(a), b: stat(b) })}</span>
        <span className="calc-rec-line">{t("calc.suggestedNature", { name: natureLabel(nature, lang, t) })}</span>
      </div>
      <button
        type="button"
        className="btn btn-ghost calc-apply"
        onClick={() => {
          const patch: CalcInputs = { nature: rec.natureId };
          for (const k of STAT_KEYS) {
            patch[`iv.${k}`] = rec.ivs[k];
            patch[`ev.${k}`] = rec.evs[k];
          }
          setInputs(patch);
        }}
      >
        {t("calc.apply")}
      </button>
      <p className="muted calc-rec-ai">{t("calc.aiDisclaimer")}</p>
    </div>
  );
});

const CalcBody = memo(function CalcBody({ baseStats }: { baseStats: BaseStats }) {
  const t = useT();
  const lang = useTermsLanguage("calc");
  const inputs = useCalcInputs();
  const state = useMemo(() => readCalcState(inputs), [inputs]);
  return (
    <div className="calc-wrap">
      <div className="calc-body">
        <div className="calc-left">
          <div className="calc-inputs">
            <label>
              {t("calc.level")}
              <input
                type="number"
                id="c-lv"
                inputMode="numeric"
                min={1}
                max={100}
                step={1}
                value={state.level}
                onChange={(e) => setInputs({ level: clampInt(e.target.value, 1, 100, 1) })}
              />
            </label>
            <label>
              {t("calc.nature")}
              <select id="c-nat" value={state.nature} onChange={(e) => setInputs({ nature: e.target.value })}>
                {NATURES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {natureLabel(n, lang, t)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <StatInputs state={state} />
        </div>
        <div className="calc-right">
          <CalcOutput baseStats={baseStats} state={state} />
          <p className="muted calc-hint">{t("calc.hint")}</p>
          <Recommendation baseStats={baseStats} lang={lang} />
        </div>
      </div>
    </div>
  );
});

export const CalculatorsPanel = memo(function CalculatorsPanel({ baseStats, types }: { baseStats: BaseStats; types: readonly string[] }) {
  const t = useT();
  const open = useScreenUi("detail", "calcOpen");
  const { updateUi } = useNavigationActions();
  return (
    <details
      className="panel calc"
      id="calc"
      style={{ "--i": 9 } as CSSProperties}
      open={open}
      onToggle={(e) => {
        const next = (e.currentTarget as HTMLDetailsElement).open;
        if (next !== open) updateUi<"detail">({ calcOpen: next });
      }}
    >
      <summary>
        {t("detail.calc")}
        <span className="caret">
          <ChevronDown aria-hidden="true" />
        </span>
      </summary>
      {open ? (
        <>
          <CalcBody baseStats={baseStats} />
          <TypeCalculator initial={types} />
        </>
      ) : null}
    </details>
  );
});

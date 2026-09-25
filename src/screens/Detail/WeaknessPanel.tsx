// Fraquezas e resistencias (F4.2; porta weakGridHTML app.js:813-819): effectivenessAgainst(types) (B6.1) agrupado em
// x4, x2, x1/2, x1/4, x0. O seletor Todos/Fraquezas/Resistencias vive em current.ui.weakFilter (RF-18) e so a
// grade re-renderiza; os chips seguem o idioma de termos do card (TermsToggle "weak").
import { memo, useMemo, type CSSProperties } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TermsToggle } from "../../components/TermsToggle";
import { TypeChip } from "../../components/TypeChip";
import type { TypeId } from "../../data/types";
import { effectivenessAgainst, groupByMultiplier, type MultiplierGroup } from "../../domain/type-chart";
import { useT } from "../../i18n/useT";
import type { WeakFilter } from "../../navigation/types";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useTermsLanguage } from "../../state/preferences-store";

export const MULT_LABEL: Record<MultiplierGroup["multiplier"], { text: string; cls: string }> = {
  4: { text: "x4", cls: "mult-4" },
  2: { text: "x2", cls: "mult-2" },
  0.5: { text: "x½", cls: "mult-half" },
  0.25: { text: "x¼", cls: "mult-quarter" },
  0: { text: "x0", cls: "mult-0" },
};

export function filterGroups(groups: MultiplierGroup[], filter: WeakFilter): MultiplierGroup[] {
  if (filter === "all") return groups;
  return groups.filter((g) => (filter === "weak" ? g.multiplier > 1 : g.multiplier < 1));
}

export const WeakGrid = memo(function WeakGrid({ types, filter, cardKey }: { types: readonly TypeId[]; filter: WeakFilter; cardKey: string }) {
  const lang = useTermsLanguage(cardKey);
  const groups = useMemo(() => groupByMultiplier(effectivenessAgainst(types)), [types]);
  const rows = filterGroups(groups, filter);
  if (rows.length === 0) return <p className="muted">{"-"}</p>;
  return (
    <div className="weak-grid part-in" key={filter}>
      {rows.map((g) => (
        <div className="weak-row" key={g.multiplier} data-mult={g.multiplier}>
          <span className={`mult ${MULT_LABEL[g.multiplier].cls}`}>{MULT_LABEL[g.multiplier].text}</span>
          <div className="chips">
            {g.types.map((type) => (
              <TypeChip key={type} type={type} lang={lang} size="sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

function WeakSelector() {
  const t = useT();
  const value = useScreenUi("detail", "weakFilter");
  const { updateUi } = useNavigationActions();
  return (
    <SegmentedControl<WeakFilter>
      className="seg-sm"
      ariaLabel={t("detail.weak")}
      value={value}
      onChange={(v) => updateUi<"detail">({ weakFilter: v })}
      options={[
        { value: "all", label: t("weak.all") },
        { value: "weak", label: t("weak.weak") },
        { value: "res", label: t("weak.res") },
      ]}
    />
  );
}

function WeakGridFromUi({ types }: { types: readonly TypeId[] }) {
  const filter = useScreenUi("detail", "weakFilter");
  return <WeakGrid types={types} filter={filter} cardKey="weak" />;
}

export const WeaknessPanel = memo(function WeaknessPanel({ types }: { types: readonly TypeId[] }) {
  const t = useT();
  return (
    <div className="panel weak-panel" id="weak-panel" style={{ "--i": 2 } as CSSProperties}>
      <div className="panel-head">
        <h3>{t("detail.weak")}</h3>
        <div className="ph-right">
          <WeakSelector />
          <TermsToggle cardKey="weak" />
        </div>
      </div>
      <WeakGridFromUi types={types} />
    </div>
  );
});

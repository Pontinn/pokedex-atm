// Calculadora de efetividade (F5.4, RF-34): 1-2 tipos do "meu Pokemon" (pre-preenchidos com os da ficha, editaveis) ->
// grade dos 18 atacantes com o multiplicador (x4, x2, x1, x1/2, x1/4, x0) via effectivenessAgainst (B6.1).
// Os tipos escolhidos vivem em current.ui.calcInputs (t1/t2), como os demais inputs da calculadora.
import { memo, useMemo } from "react";
import { TypeChip, typeName } from "../../components/TypeChip";
import type { TypeId } from "../../data/types";
import { effectivenessAgainst, TYPE_IDS, type Effectiveness } from "../../domain/type-chart";
import { useT } from "../../i18n/useT";
import { useNavigationStore } from "../../navigation/navigation-store";
import { useScreenUi } from "../../navigation/useNavigation";
import { useTermsLanguage } from "../../state/preferences-store";

export const EFFECT_LABEL: Record<Effectiveness, { text: string; cls: string }> = {
  4: { text: "x4", cls: "mult-4" },
  2: { text: "x2", cls: "mult-2" },
  1: { text: "x1", cls: "mult-1" },
  0.5: { text: "x½", cls: "mult-half" },
  0.25: { text: "x¼", cls: "mult-quarter" },
  0: { text: "x0", cls: "mult-0" },
};

const isType = (v: unknown): v is TypeId => typeof v === "string" && (TYPE_IDS as readonly string[]).includes(v);

/** Tipos escolhidos: t1 obrigatorio (fallback = 1o tipo da ficha), t2 opcional ("" = nenhum), nunca repetido. */
export function selectedTypes(inputs: Record<string, number | string>, initial: readonly string[]): TypeId[] {
  const t1 = isType(inputs.t1) ? inputs.t1 : isType(initial[0]) ? initial[0] : "normal";
  const raw2 = inputs.t2 === undefined ? initial[1] : inputs.t2;
  const t2 = isType(raw2) && raw2 !== t1 ? raw2 : null;
  return t2 ? [t1, t2] : [t1];
}

function setTypeInput(patch: Record<string, string>) {
  const current = useNavigationStore.getState().current.ui as { calcInputs?: Record<string, number | string> };
  useNavigationStore.getState().updateUi<"detail">({ calcInputs: { ...(current.calcInputs ?? {}), ...patch } });
}

export const TypeCalculator = memo(function TypeCalculator({ initial }: { initial: readonly string[] }) {
  const t = useT();
  const lang = useTermsLanguage("calc");
  const inputs = useScreenUi("detail", "calcInputs");
  const types = useMemo(() => selectedTypes(inputs, initial), [inputs, initial]);
  const map = useMemo(() => effectivenessAgainst(types), [types]);
  const options = TYPE_IDS.map((ty) => (
    <option key={ty} value={ty}>
      {typeName(ty, lang)}
    </option>
  ));
  return (
    <div className="type-calc" id="type-calc">
      <h4>{t("calc.typeTitle")}</h4>
      <div className="calc-inputs type-calc-inputs">
        <label>
          {t("calc.type1")}
          <select id="c-t1" value={types[0]} onChange={(e) => setTypeInput({ t1: e.target.value })}>
            {options}
          </select>
        </label>
        <label>
          {t("calc.type2")}
          <select id="c-t2" value={types[1] ?? ""} onChange={(e) => setTypeInput({ t2: e.target.value })}>
            <option value="">{t("calc.typeNone")}</option>
            {options}
          </select>
        </label>
      </div>
      <div className="type-calc-grid">
        {TYPE_IDS.map((ty) => {
          const m = map[ty];
          return (
            <div className="tc-cell" key={ty} data-attacker={ty} data-mult={m}>
              <TypeChip type={ty} lang={lang} size="sm" />
              <span className={`mult ${EFFECT_LABEL[m].cls}`}>{EFFECT_LABEL[m].text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

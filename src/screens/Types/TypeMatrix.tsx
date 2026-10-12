// Tabela completa 18 x 18 (RF-25..RF-30, RF-48): linha = quem ataca, coluna = quem defende; cabecalhos selecionam o tipo,
// celulas so informam (aria-label completo). Primeira coluna fixa e opaca; so o container rola na horizontal.
import { memo } from "react";
import { TypeIcon } from "../../components/TypeIcon";
import { typeName } from "../../components/TypeChip";
import type { TypeId } from "../../data/types";
import { TYPE_IDS } from "../../domain/type-chart";
import { useT } from "../../i18n/useT";
import { useScreenUi } from "../../navigation/useNavigation";
import { usePreferencesStore } from "../../state/preferences-store";
import { selectType } from "./TypePicker";
import { MULT_SYMBOL, matrixRows } from "./types-model";

const ROWS = matrixRows();

export const TypeMatrix = memo(function TypeMatrix() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const selected = useScreenUi("types", "selected");
  const name = (ty: TypeId) => typeName(ty, lang);
  return (
    <div className="panel tp-matrix-panel">
      <p className="tp-matrix-caption" id="tp-matrix-cap">
        {t("types.matrixCaption")}
      </p>
      <div className="tp-matrix-scroll" role="region" aria-labelledby="tp-matrix-cap" tabIndex={0}>
        <table className="tp-matrix" aria-labelledby="tp-matrix-cap">
          <thead>
            <tr>
              <td className="tp-corner" />
              {TYPE_IDS.map((d) => (
                <th key={d} scope="col" className={`tp-col-head${d === selected ? " is-sel" : ""}`}>
                  <button
                    type="button"
                    className="tp-head"
                    data-axis="col"
                    data-type={d}
                    aria-pressed={d === selected}
                    aria-label={t("types.colHeader", { type: name(d) })}
                    onClick={() => selectType(d)}
                  >
                    <TypeIcon type={d} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.attacker} data-row={row.attacker} className={row.attacker === selected ? "is-sel" : undefined}>
                <th scope="row" className={`tp-row-head${row.attacker === selected ? " is-sel" : ""}`}>
                  <button
                    type="button"
                    className="tp-head"
                    data-axis="row"
                    data-type={row.attacker}
                    aria-pressed={row.attacker === selected}
                    aria-label={t("types.rowHeader", { type: name(row.attacker) })}
                    onClick={() => selectType(row.attacker)}
                  >
                    <TypeIcon type={row.attacker} />
                  </button>
                </th>
                {row.cells.map((c) => (
                  <td
                    key={c.defender}
                    className={`tp-cell tone-${c.tone}${c.defender === selected ? " is-col" : ""}`}
                    data-def={c.defender}
                    data-mult={c.multiplier}
                    data-tone={c.tone}
                    aria-label={t("types.cellLabel", { atk: name(c.attacker), def: name(c.defender), mult: MULT_SYMBOL[c.multiplier] })}
                  >
                    {c.symbol}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

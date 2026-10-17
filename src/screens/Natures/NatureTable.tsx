// Tabela 5 x 5 das naturezas: linha = status que aumenta (verde, +), coluna = status que diminui (laranja, -).
// Celula = botao com o nome; diagonal = natureza neutra em cinza. Primeira coluna fixa e opaca (fundo da celula inteira,
// inclusive o espaco entre os blocos); so o container rola, e no celular ele encaixa coluna a coluna.
import { memo } from "react";
import { useT } from "../../i18n/useT";
import { useScreenUi } from "../../navigation/useNavigation";
import { useTermsLanguage } from "../../state/preferences-store";
import { MINUS, PLUS, STAT_LABEL, natureGrid, natureName } from "./natures-model";
import { selectNature } from "./select";

const ROWS = natureGrid();

export const NatureTable = memo(function NatureTable() {
  const t = useT();
  const lang = useTermsLanguage("natures");
  const selected = useScreenUi("natures", "selected");
  return (
    <div className="panel nt-table-panel">
      <p className="nt-caption" id="nt-table-cap">
        {t("natures.tableCaption")}
      </p>
      <div className="nt-table-scroll" role="region" aria-labelledby="nt-table-cap" tabIndex={0}>
        <table className="nt-table" aria-labelledby="nt-table-cap">
          <thead>
            <tr>
              <td className="nt-corner">
                <div className="nt-corner-box">
                  <span className="nt-corner-col">
                    {t("natures.cornerCol")} {MINUS}
                  </span>
                  <span className="nt-corner-row">
                    {t("natures.cornerRow")} {PLUS}
                  </span>
                </div>
              </td>
              {ROWS.map((r) => (
                <th
                  key={r.up}
                  scope="col"
                  className="nt-col-head"
                  data-down={r.up}
                  aria-label={t("natures.colHeader", { stat: t(STAT_LABEL[r.up]) })}
                >
                  <span className="nt-head tone-dis">
                    {MINUS} {t(STAT_LABEL[r.up])}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.up} data-up={row.up}>
                <th scope="row" className="nt-row-head" aria-label={t("natures.rowHeader", { stat: t(STAT_LABEL[row.up]) })}>
                  <span className="nt-head tone-adv">
                    {PLUS} {t(STAT_LABEL[row.up])}
                  </span>
                </th>
                {row.cells.map((c) => {
                  const on = c.nature.id === selected;
                  const name = natureName(c.nature, lang);
                  return (
                    <td key={c.down} className={`nt-cell${c.neutral ? " is-neutral" : ""}`} data-down={c.down}>
                      <button
                        type="button"
                        className={`nt-pick${c.neutral ? " tone-zero" : ""}${on ? " on" : ""}`}
                        data-nature={c.nature.id}
                        data-neutral={c.neutral ? "true" : undefined}
                        aria-pressed={on}
                        aria-label={
                          c.neutral
                            ? t("natures.cellNeutral", { name })
                            : t("natures.cellLabel", { name, up: t(STAT_LABEL[c.up]), down: t(STAT_LABEL[c.down]) })
                        }
                        onClick={() => selectNature(c.nature.id)}
                      >
                        <span className="nt-pick-name">{name}</span>
                        {c.neutral ? <span className="nt-neutral-mark">{t("natures.neutralMark")}</span> : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

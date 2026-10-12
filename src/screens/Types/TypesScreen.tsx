// Pagina Tipos (type-chart, RF-01..RF-49): legenda fixa, seletor de visao e as duas visoes.
// Deriva tudo de src/domain/type-chart.ts via types-model.ts; estado no ui da entrada "types" da pilha.
import "./types.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { SegmentedControl } from "../../components/SegmentedControl";
import { useT } from "../../i18n/useT";
import type { TypesView } from "../../navigation/types";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { TypeFocus } from "./TypeFocus";
import { TypeMatrix } from "./TypeMatrix";
import { TypePicker } from "./TypePicker";

function TypesLegend() {
  const t = useT();
  return (
    <div className="panel tp-legend">
      <h3>{t("types.legendTitle")}</h3>
      <ul className="tp-legend-list">
        <li>{t("types.legend2")}</li>
        <li>{t("types.legendHalf")}</li>
        <li>{t("types.legend0")}</li>
        <li>{t("types.legend4")}</li>
        <li>{t("types.legendQuarter")}</li>
      </ul>
      <p className="tp-legend-color">
        <span className="tp-swatches" aria-hidden="true">
          <i className="tone-adv" />
          <i className="tone-dis" />
          <i className="tone-zero" />
        </span>
        <span>{t("types.legendBands")}</span>
      </p>
      <p className="tp-legend-color">
        <span className="tp-swatches" aria-hidden="true">
          <i className="tone-adv" />
          <i className="tone-dis" />
          <i className="tone-zero" />
        </span>
        <span>{t("types.legendTable")}</span>
      </p>
    </div>
  );
}

function ByTypeView() {
  const t = useT();
  const selected = useScreenUi("types", "selected");
  return (
    <>
      <div className="panel tp-pick-panel">
        <TypePicker />
        {selected === null ? <p className="tp-instr">{t("types.pick")}</p> : null}
      </div>
      {selected !== null ? <TypeFocus type={selected} /> : null}
    </>
  );
}

export function TypesScreen(_props: ScreenProps) {
  const t = useT();
  const { updateUi } = useNavigationActions();
  const view = useScreenUi("types", "view");
  return (
    <section className="types-screen">
      <div className="page-head">
        <h2>{t("nav.types")}</h2>
      </div>
      <TypesLegend />
      <SegmentedControl<TypesView>
        className="tp-view"
        ariaLabel={t("types.viewLabel")}
        value={view}
        options={[
          { value: "byType", label: t("types.viewByType") },
          { value: "chart", label: t("types.viewChart") },
        ]}
        onChange={(v) => updateUi<"types">({ view: v })}
      />
      {view === "byType" ? <ByTypeView /> : <TypeMatrix />}
    </section>
  );
}

// Pagina Naturezas (natures, quick): o que cada natureza aumenta e diminui.
// Deriva tudo de src/domain/natures.ts via natures-model.ts; estado no ui da entrada "natures" da pilha.
import "./natures.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { useT } from "../../i18n/useT";
import { useScreenUi } from "../../navigation/useNavigation";
import { NatureFocus } from "./NatureFocus";
import { NatureTable } from "./NatureTable";

function NaturesLegend() {
  const t = useT();
  return (
    <div className="panel nt-legend">
      <h3>{t("natures.legendTitle")}</h3>
      <p className="nt-legend-rule">{t("natures.legendRule")}</p>
      <p className="nt-legend-rule">{t("natures.legendNeutral")}</p>
      <p className="nt-legend-color">
        <span className="nt-swatches" aria-hidden="true">
          <i className="tone-adv" />
          <i className="tone-dis" />
          <i className="tone-zero" />
        </span>
        <span>{t("natures.legendColors")}</span>
      </p>
    </div>
  );
}

export function NaturesScreen(_props: ScreenProps) {
  const t = useT();
  const selected = useScreenUi("natures", "selected");
  return (
    <section className="natures-screen">
      <div className="page-head">
        <h2>{t("nav.natures")}</h2>
      </div>
      <NaturesLegend />
      <NatureTable />
      {selected !== null ? <NatureFocus id={selected} /> : <p className="nt-instr">{t("natures.pick")}</p>}
    </section>
  );
}

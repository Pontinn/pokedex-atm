// Pagina Naturezas (natures, quick): o que cada natureza aumenta e diminui.
// Deriva tudo de src/domain/natures.ts via natures-model.ts; estado no ui da entrada "natures" da pilha.
import "./natures.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TermsToggle } from "../../components/TermsToggle";
import { useT } from "../../i18n/useT";
import type { NaturesView } from "../../navigation/types";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { NatureByStat } from "./NatureByStat";
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
  const { updateUi } = useNavigationActions();
  const view = useScreenUi("natures", "view");
  const stat = useScreenUi("natures", "stat");
  const selected = useScreenUi("natures", "selected");
  const showPick = view === "table" || stat !== null;
  return (
    <section className="natures-screen">
      <div className="page-head">
        <h2>{t("nav.natures")}</h2>
        <TermsToggle cardKey="natures" />
      </div>
      <NaturesLegend />
      <SegmentedControl<NaturesView>
        className="nt-view"
        ariaLabel={t("natures.viewLabel")}
        value={view}
        options={[
          { value: "table", label: t("natures.viewTable") },
          { value: "byStat", label: t("natures.viewByStat") },
        ]}
        onChange={(v) => updateUi<"natures">({ view: v })}
      />
      {view === "table" ? <NatureTable /> : <NatureByStat />}
      {selected !== null ? <NatureFocus id={selected} /> : showPick ? <p className="nt-instr">{t("natures.pick")}</p> : null}
    </section>
  );
}

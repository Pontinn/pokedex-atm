// Pagina Naturezas (natures, quick): o que cada natureza aumenta e diminui.
// Deriva tudo de src/domain/natures.ts via natures-model.ts; estado no ui da entrada "natures" da pilha.
import type { ScreenProps } from "../../components/ScreenRouter";
import { useT } from "../../i18n/useT";

export function NaturesScreen(_props: ScreenProps) {
  const t = useT();
  return (
    <section className="natures-screen">
      <div className="page-head">
        <h2>{t("nav.natures")}</h2>
      </div>
    </section>
  );
}

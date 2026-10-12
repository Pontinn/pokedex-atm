// Pagina Tipos (type-chart, RF-01..RF-49): legenda fixa, seletor de visao e as duas visoes.
// Deriva tudo de src/domain/type-chart.ts via types-model.ts; estado no ui da entrada "types" da pilha.
import "./types.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { useT } from "../../i18n/useT";

export function TypesScreen(_props: ScreenProps) {
  const t = useT();
  return (
    <section className="types-screen">
      <div className="page-head">
        <h2>{t("nav.types")}</h2>
      </div>
    </section>
  );
}

// Selecao de natureza (tabela e faixas): tocar na ja selecionada nao escreve nada.
import { useNavigationStore } from "../../navigation/navigation-store";
import type { NaturesUi } from "./natures-model";

export function selectNature(id: string): void {
  const ui = useNavigationStore.getState().current.ui as NaturesUi;
  if (ui.selected !== id) useNavigationStore.getState().updateUi<"natures">({ selected: id });
}

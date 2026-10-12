// Grade dos 18 tipos (RF-11, RF-12): chip-botao no padrao do Dex (DexFilters.tsx), quebrando linha.
import { memo } from "react";
import { Check } from "../../components/Icon";
import { TypeIcon } from "../../components/TypeIcon";
import { typeName } from "../../components/TypeChip";
import type { TypeId } from "../../data/types";
import { TYPE_IDS } from "../../domain/type-chart";
import { useT } from "../../i18n/useT";
import { useNavigationStore } from "../../navigation/navigation-store";
import { useScreenUi } from "../../navigation/useNavigation";
import { usePreferencesStore } from "../../state/preferences-store";
import { nextSelection, type TypesUi } from "./types-model";

/** Seleciona um tipo (grade e cabecalhos da matriz); tocar no ja selecionado nao escreve nada. */
export function selectType(type: TypeId): void {
  const ui = useNavigationStore.getState().current.ui as TypesUi;
  const patch = nextSelection(ui, type);
  if (patch) useNavigationStore.getState().updateUi<"types">(patch);
}

export const TypePicker = memo(function TypePicker() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const selected = useScreenUi("types", "selected");
  return (
    <div className="tp-grid" role="group" aria-label={t("types.pickLabel")}>
      {TYPE_IDS.map((type) => {
        const on = type === selected;
        return (
          <button
            key={type}
            type="button"
            className={`chip t-${type} tp-pick${on ? " on" : ""}`}
            data-pick={type}
            aria-pressed={on}
            onClick={() => selectType(type)}
          >
            <TypeIcon type={type} />
            <span>{typeName(type, lang)}</span>
            <Check className="chip-check" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
});

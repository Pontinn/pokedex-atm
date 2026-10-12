// Bloco do tipo escolhido (RF-13, RF-22, RF-23): icone grande, nome e frase de intuicao.
import { memo } from "react";
import { TypeIcon } from "../../components/TypeIcon";
import { typeName } from "../../components/TypeChip";
import type { TypeId } from "../../data/types";
import { useT } from "../../i18n/useT";
import { usePreferencesStore } from "../../state/preferences-store";
import { HINT_KEYS, TYPE_NAME_JOIN } from "./types-model";

export const TypeFocus = memo(function TypeFocus({ type }: { type: TypeId }) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const heroTypes: TypeId[] = [type];
  return (
    <div className={`panel tp-hero t-${type}`} data-hero={type}>
      <div className="tp-hero-icons">
        {heroTypes.map((ty) => (
          <TypeIcon key={ty} type={ty} className="tp-ti-xl" />
        ))}
      </div>
      <div className="tp-hero-text">
        <h3>{heroTypes.map((ty) => typeName(ty, lang)).join(TYPE_NAME_JOIN)}</h3>
        <p className="tp-hint">{t(HINT_KEYS[type])}</p>
      </div>
    </div>
  );
});

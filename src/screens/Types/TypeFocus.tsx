// Bloco do tipo escolhido (RF-13..RF-18, RF-22, RF-23): icone grande, nome, frase de intuicao,
// abas Atacando/Defendendo e faixas coloridas por vantagem do ponto de vista da aba.
import { memo, useMemo } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TypeIcon } from "../../components/TypeIcon";
import { typeName } from "../../components/TypeChip";
import type { TypeId } from "../../data/types";
import { useT } from "../../i18n/useT";
import type { TypesTab } from "../../navigation/types";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { usePreferencesStore } from "../../state/preferences-store";
import { HINT_KEYS, TYPE_NAME_JOIN, attackGroups, defendGroups } from "./types-model";

export const TypeFocus = memo(function TypeFocus({ type }: { type: TypeId }) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const { updateUi } = useNavigationActions();
  const tab = useScreenUi("types", "tab");
  const groups = useMemo(() => (tab === "attack" ? attackGroups(type) : defendGroups([type])), [tab, type]);
  const heroTypes: TypeId[] = [type];
  return (
    <>
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
      <div className="tp-tabs-row">
        <SegmentedControl<TypesTab>
          className="tp-tab"
          ariaLabel={t("types.tabLabel")}
          value={tab}
          options={[
            { value: "attack", label: t("types.tabAttack") },
            { value: "defend", label: t("types.tabDefend") },
          ]}
          onChange={(v) => updateUi<"types">({ tab: v })}
        />
      </div>
      <div className="tp-bands" data-tab={tab}>
        {groups.map((g) => (
          <section
            key={g.multiplier}
            className={`tp-band tone-${g.tone}`}
            data-mult={g.multiplier}
            data-tone={g.tone}
            aria-labelledby={`tp-band-${g.tone}`}
          >
            <h4 id={`tp-band-${g.tone}`}>{t(g.titleKey)}</h4>
            {g.types.length > 0 ? (
              <ul className="tp-band-list">
                {g.types.map((ty) => (
                  <li key={ty} className="tp-band-item" data-type={ty}>
                    <TypeIcon type={ty} className="tp-ti-lg" />
                    <span className="tp-band-name">{typeName(ty, lang)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="tp-none">{t("types.none")}</p>
            )}
          </section>
        ))}
      </div>
    </>
  );
});

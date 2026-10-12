// Bloco do tipo escolhido (RF-13..RF-18, RF-22, RF-23): icone grande, nome, frase de intuicao,
// abas Atacando/Defendendo, faixas coloridas por vantagem do ponto de vista da aba e 2o tipo opcional na defesa (RF-37..RF-39).
import { memo, useMemo } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TypeIcon } from "../../components/TypeIcon";
import { typeName } from "../../components/TypeChip";
import type { TypeId } from "../../data/types";
import { useT } from "../../i18n/useT";
import type { TypesTab } from "../../navigation/types";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { usePreferencesStore } from "../../state/preferences-store";
import { HINT_KEYS, TYPE_NAME_JOIN, attackGroups, defendGroups, parseSecond, secondOptions } from "./types-model";

function SecondTypeSelect({ first }: { first: TypeId }) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const { updateUi } = useNavigationActions();
  const second = useScreenUi("types", "second");
  return (
    <label className="tp-second">
      <span>{t("types.secondLabel")}</span>
      <select id="tp-second" value={second ?? ""} onChange={(e) => updateUi<"types">({ second: parseSecond(e.target.value, first) })}>
        <option value="">{t("types.none")}</option>
        {secondOptions(first).map((ty) => (
          <option key={ty} value={ty}>
            {typeName(ty, lang)}
          </option>
        ))}
      </select>
    </label>
  );
}

export const TypeFocus = memo(function TypeFocus({ type }: { type: TypeId }) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const { updateUi } = useNavigationActions();
  const tab = useScreenUi("types", "tab");
  const second = useScreenUi("types", "second");
  // o 2o tipo so vale na aba Defendendo (RF-37); fica guardado no ui ao trocar de aba
  const defenders = useMemo<TypeId[]>(() => (tab === "defend" && second !== null ? [type, second] : [type]), [tab, type, second]);
  const groups = useMemo(() => (tab === "attack" ? attackGroups(type) : defendGroups(defenders)), [tab, type, defenders]);
  const heroTypes = defenders;
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
        {tab === "defend" ? <SecondTypeSelect first={type} /> : null}
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

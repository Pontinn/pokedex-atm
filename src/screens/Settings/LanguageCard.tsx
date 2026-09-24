// Idioma da interface (F10.1, RF-81/RF-85): seg PT/EN -> setUiLanguage (nao mexe nos overrides dos cards).
import { memo } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import { useT } from "../../i18n/useT";
import { usePreferencesStore } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";

export const LanguageCard = memo(function LanguageCard() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const setUiLanguage = usePreferencesStore((s) => s.setUiLanguage);
  return (
    <div className="card" data-card="language">
      <h3>{t("settings.language")}</h3>
      <p className="muted">{t("settings.languageHint")}</p>
      <SegmentedControl<UiLanguage>
        className="lang-seg"
        ariaLabel={t("settings.language")}
        value={lang}
        onChange={setUiLanguage}
        options={[
          { value: "pt", label: t("settings.languagePt") },
          { value: "en", label: t("settings.languageEn") },
        ]}
      />
    </div>
  );
});

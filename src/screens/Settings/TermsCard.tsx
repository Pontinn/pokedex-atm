// Idioma padrao dos termos do jogo (F10.1, porta renderTermsSetting app.js:1038-1041).
// Mudar o padrao limpa os overrides por card (app.js:1343, RF-86).
import { memo, useCallback } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import { useT } from "../../i18n/useT";
import { usePreferencesStore } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { applyTermsDefault } from "./data-actions";

export const TermsCard = memo(function TermsCard() {
  const t = useT();
  const termsLanguage = usePreferencesStore((s) => s.termsLanguage);
  const onChange = useCallback((lang: UiLanguage) => {
    applyTermsDefault(lang).catch((err: unknown) => console.warn("[settings] terms default", err));
  }, []);
  return (
    <div className="card" data-card="terms">
      <h3>{t("settings.terms")}</h3>
      <p className="muted">{t("settings.termsHint")}</p>
      <SegmentedControl<UiLanguage>
        className="terms-seg"
        ariaLabel={t("settings.terms")}
        value={termsLanguage}
        onChange={onChange}
        options={[
          { value: "pt", label: t("settings.termsPt") },
          { value: "en", label: t("settings.termsEn") },
        ]}
      />
    </div>
  );
});

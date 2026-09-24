// Toggle PT | EN dos termos de jogo por card (prototipo termsTgl(), app.js:657; RF-84/RF-86).
// Grava o override do card na store (persistido). So o card que le useTermsLanguage(cardKey) re-renderiza.
import { memo } from "react";
import { Languages } from "./Icon";
import { usePreferencesStore, useTermsLanguage } from "../state/preferences-store";
import type { UiLanguage } from "../storage/types";
import { useT } from "../i18n/useT";

const LANGS: readonly UiLanguage[] = ["pt", "en"];

export interface TermsToggleProps {
  cardKey: string;
}

export const TermsToggle = memo(function TermsToggle({ cardKey }: TermsToggleProps) {
  const current = useTermsLanguage(cardKey);
  const setTermsOverride = usePreferencesStore((s) => s.setTermsOverride);
  const t = useT();
  return (
    <div className="seg seg-xs terms-tgl" data-tcard={cardKey} title={t("terms.toggleTitle")} role="group">
      <Languages aria-hidden="true" />
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          className={current === lang ? "active" : ""}
          aria-pressed={current === lang}
          data-tl={lang}
          onClick={() => {
            if (current !== lang) setTermsOverride(cardKey, lang);
          }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
});

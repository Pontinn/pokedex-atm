// Grade de temas (F10.1, porta renderThemes app.js:1042-1045): 7 amostras na ordem canonica de THEME_IDS.
import { memo, type CSSProperties } from "react";
import { useT } from "../../i18n/useT";
import type { MessageKey } from "../../i18n/messages";
import { usePreferencesStore } from "../../state/preferences-store";
import { DEFAULT_THEME, THEMES } from "../../styles/theme-meta";
import { THEME_IDS } from "../../styles/themes";

export const ThemeGrid = memo(function ThemeGrid() {
  const t = useT();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  return (
    <div className="card" data-card="theme">
      <h3>{t("settings.theme")}</h3>
      <p className="muted">{t("settings.themeHint")}</p>
      <div className="theme-grid" role="radiogroup" aria-label={t("settings.theme")}>
        {THEME_IDS.map((id) => {
          const meta = THEMES[id];
          const style = { "--p1": meta.p1, "--p2": meta.p2 } as CSSProperties;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={theme === id}
              className={`theme-sw${theme === id ? " active" : ""}`}
              data-theme-pick={id}
              style={style}
              onClick={() => setTheme(id)}
            >
              <span className="sw" aria-hidden="true" />
              <span className="sw-text">
                <span className="sw-name">
                  <span>{t(meta.labelKey as MessageKey)}</span>
                  {id === DEFAULT_THEME ? <span className="pill">{t("settings.default")}</span> : null}
                </span>
                <span className="sw-sub">{t(meta.subKey as MessageKey)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// Toggles do shell (index.html:51-55 e 67-70 do prototipo): som, idioma e (so na sidebar) tema em ciclo.
import { Palette, Volume2, VolumeX } from "./Icon";
import { useT } from "../i18n/useT";
import { usePreferencesStore } from "../state/preferences-store";
import { THEME_IDS } from "../styles/themes";

export function nextThemeId(current: string): (typeof THEME_IDS)[number] {
  const i = THEME_IDS.indexOf(current as (typeof THEME_IDS)[number]);
  return THEME_IDS[(i + 1) % THEME_IDS.length] ?? THEME_IDS[0];
}

export function SoundToggle() {
  const t = useT();
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const setSoundEnabled = usePreferencesStore((s) => s.setSoundEnabled);
  return (
    <button
      type="button"
      className={`tgl tgl-sound${soundEnabled ? "" : " off"}`}
      title={t("shell.sound")}
      aria-label={t("shell.sound")}
      aria-pressed={soundEnabled}
      onClick={() => setSoundEnabled(!soundEnabled)}
    >
      <span className="tgl-ico">{soundEnabled ? <Volume2 /> : <VolumeX />}</span>
    </button>
  );
}

export function LanguageToggle() {
  const t = useT();
  const uiLanguage = usePreferencesStore((s) => s.uiLanguage);
  const setUiLanguage = usePreferencesStore((s) => s.setUiLanguage);
  return (
    <button
      type="button"
      className="tgl tgl-lang"
      title={t("shell.language")}
      aria-label={t("shell.language")}
      onClick={() => setUiLanguage(uiLanguage === "pt" ? "en" : "pt")}
    >
      <span className="tgl-txt">{uiLanguage.toUpperCase()}</span>
    </button>
  );
}

export function ThemeToggle() {
  const t = useT();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  return (
    <button
      type="button"
      className="tgl tgl-theme"
      title={t("shell.theme")}
      aria-label={t("shell.theme")}
      onClick={() => setTheme(nextThemeId(theme))}
    >
      <span className="tgl-ico">
        <Palette />
      </span>
    </button>
  );
}

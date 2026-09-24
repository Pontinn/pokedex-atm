// Som (F10.1, RF-88): switch que grava preferences.soundEnabled na hora.
import { memo } from "react";
import { Switch } from "../../components/Switch";
import { useT } from "../../i18n/useT";
import { usePreferencesStore } from "../../state/preferences-store";

export const SoundCard = memo(function SoundCard() {
  const t = useT();
  const enabled = usePreferencesStore((s) => s.soundEnabled);
  const setSoundEnabled = usePreferencesStore((s) => s.setSoundEnabled);
  return (
    <div className="setting-row" data-row="sound">
      <div className="setting-text">
        <h3>{t("settings.sound")}</h3>
        <p className="muted">{t("settings.soundHint")}</p>
      </div>
      <Switch id="sw-sound" checked={enabled} onChange={setSoundEnabled} ariaLabel={t("settings.sound")} />
    </div>
  );
});

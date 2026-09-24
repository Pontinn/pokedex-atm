// Reduzir animacoes (F10.1, RF-89/RF-90): switch com 3o estado "Seguir o sistema" (reduceMotion null).
import { memo } from "react";
import { Switch } from "../../components/Switch";
import { useT } from "../../i18n/useT";
import { resolveReduceMotion } from "../../state/motion";
import { usePreferencesStore } from "../../state/preferences-store";

export const MotionCard = memo(function MotionCard() {
  const t = useT();
  const pref = usePreferencesStore((s) => s.reduceMotion);
  const setReduceMotion = usePreferencesStore((s) => s.setReduceMotion);
  const effective = resolveReduceMotion(pref);
  const followSystem = pref === null;
  return (
    <div className="setting-row" data-row="motion">
      <div className="setting-text">
        <h3>{t("settings.motion")}</h3>
        <p className="muted">{t("settings.motionHint")}</p>
        <label className="motion-system">
          <input
            type="checkbox"
            checked={followSystem}
            onChange={(e) => setReduceMotion(e.currentTarget.checked ? null : effective)}
          />
          <span>{t("settings.motionSystem")}</span>
        </label>
      </div>
      <Switch id="sw-motion" checked={effective} onChange={(v) => setReduceMotion(v)} ariaLabel={t("settings.motion")} />
    </div>
  );
});

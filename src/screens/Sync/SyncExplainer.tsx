// Explicacao inicial da tela Sincronizar (UISPEC 8.1): .notice-info com 3 paragrafos + aviso RF-77.
import { memo } from "react";
import { Info } from "../../components/Icon";
import { useT } from "../../i18n/useT";

export const SyncExplainer = memo(function SyncExplainer() {
  const t = useT();
  return (
    <div className="notice notice-info sync-explainer">
      <Info />
      <div className="sync-explainer-text">
        <p>{t("sync.explainer1")}</p>
        <p>{t("sync.explainer2")}</p>
        <p>{t("sync.explainer3")}</p>
        <p className="sync-own">{t("sync.ownDevices")}</p>
      </div>
    </div>
  );
});

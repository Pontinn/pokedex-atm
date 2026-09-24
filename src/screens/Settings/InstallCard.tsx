// Instalar app (F10.1, RF-103): usa o beforeinstallprompt guardado por src/pwa; oculto se ja instalado.
// Sem prompt (Firefox, Safari) -> instrucao textual.
import { memo, useEffect, useState } from "react";
import { Download } from "../../components/Icon";
import { useT } from "../../i18n/useT";
import { platform } from "../../platform";
import { promptInstall } from "../../pwa/register-sw";

function isStandalone(): boolean {
  try {
    return window.matchMedia?.("(display-mode: standalone)").matches === true;
  } catch {
    return false;
  }
}

export const InstallCard = memo(function InstallCard() {
  const t = useT();
  const [canInstall, setCanInstall] = useState(() => platform.canInstall());
  const [installed, setInstalled] = useState(isStandalone);
  useEffect(() => {
    // register-sw captura o evento primeiro (listener registrado no boot); aqui so atualizamos a tela
    const onPrompt = () => setCanInstall(true);
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  if (installed) return null;
  return (
    <div className="card" data-card="install">
      <h3>{t("about.install")}</h3>
      <p className="muted">{t("settings.installHint")}</p>
      {canInstall ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            promptInstall()
              .then((accepted) => {
                setCanInstall(platform.canInstall());
                if (accepted) setInstalled(true);
              })
              .catch((err: unknown) => console.warn("[settings] install prompt", err));
          }}
        >
          <Download />
          {t("about.install")}
        </button>
      ) : (
        <p className="install-manual">{t("settings.installManual")}</p>
      )}
    </div>
  );
});

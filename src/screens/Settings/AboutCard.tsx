// Sobre (F10.1, RF-104): versao do app, versao do dataset (lida do manifesto, nunca fixa), contagens e
// armazenamento persistente. Bloco .card-info/.info-line do prototipo (index.html:230-234).
import { memo, useEffect, useState } from "react";
import { useT } from "../../i18n/useT";
import { useDatasetStore } from "../../state/dataset-store";
import { getPersistenceResult, requestPersistence } from "../../storage";

const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "0.0.0";

function InfoLine({ text, testId }: { text: string; testId?: string }) {
  return (
    <div className="info-line" data-info={testId}>
      <span className="dot" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

export const AboutCard = memo(function AboutCard() {
  const t = useT();
  const manifest = useDatasetStore((s) => s.manifest);
  const [persisted, setPersisted] = useState<boolean | null>(() => getPersistenceResult());
  useEffect(() => {
    if (persisted !== null) return;
    let alive = true;
    requestPersistence()
      .then((v) => {
        if (alive) setPersisted(v);
      })
      .catch(() => {
        if (alive) setPersisted(false);
      });
    return () => {
      alive = false;
    };
  }, [persisted]);
  const persistText = persisted === null ? t("about.checking") : persisted ? t("about.yes") : t("about.no");
  return (
    <div className="card card-info" data-card="about">
      <h3 className="card-info-title">{t("about.title")}</h3>
      <InfoLine testId="app" text={t("about.app", { v: APP_VERSION })} />
      {manifest ? (
        <>
          <InfoLine
            testId="data"
            text={t("about.dataVersion", { pack: `${manifest.pack.name} ${manifest.pack.version}`, cobblemon: manifest.cobblemonVersion })}
          />
          <InfoLine testId="dataset" text={t("about.datasetVersion", { v: manifest.datasetVersion })} />
          <InfoLine
            testId="counts"
            text={t("about.counts", {
              species: manifest.counts.species,
              fossils: manifest.counts.fossilRoutes,
              trainers: manifest.counts.trainers,
            })}
          />
        </>
      ) : (
        <InfoLine testId="data" text={t("shell.dataUnavailable")} />
      )}
      <InfoLine testId="persist" text={t("about.persistent", { v: persistText })} />
      <InfoLine text={t("settings.local")} />
      <InfoLine text={t("settings.images")} />
    </div>
  );
});

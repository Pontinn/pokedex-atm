// Tela Configuracoes (F10.1/F10.2): porta index.html:206-236 + blocos novos no mesmo padrao .card/.card-info.
import "./settings.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { useT } from "../../i18n/useT";
import { AboutCard } from "./AboutCard";
import { BackupCard } from "./BackupCard";
import { DeleteDataCard } from "./DeleteDataCard";
import { InstallCard } from "./InstallCard";
import { LanguageCard } from "./LanguageCard";
import { MotionCard } from "./MotionCard";
import { RestoreSnapshotCard } from "./RestoreSnapshotCard";
import { SoundCard } from "./SoundCard";
import { TermsCard } from "./TermsCard";
import { ThemeGrid } from "./ThemeGrid";

export function SettingsScreen(_props: ScreenProps) {
  const t = useT();
  return (
    <section className="settings-screen" data-screen="settings">
      <div className="page-head">
        <h2>{t("nav.settings")}</h2>
      </div>
      <div className="settings">
        <ThemeGrid />
        <LanguageCard />
        <div className="card" data-card="sound-motion">
          <SoundCard />
          <MotionCard />
        </div>
        <TermsCard />
        <InstallCard />
        <BackupCard />
        <DeleteDataCard />
        <RestoreSnapshotCard />
        <AboutCard />
      </div>
    </section>
  );
}

// Sidebar do desktop (index.html:35-59 do prototipo) + Sincronizar e versao dos dados do DatasetManifest (RF-104).
import pokeballUrl from "../assets/pokeball.webp";
import { useT } from "../i18n/useT";
import { useNavigationStore } from "../navigation/navigation-store";
import { useDatasetStore } from "../state/dataset-store";
import { SIDEBAR_ITEMS, navOwner } from "./nav-items";
import { PokedexLens } from "./PokedexLens";
import { LanguageToggle, SoundToggle, ThemeToggle } from "./ShellToggles";

function DatasetVersion() {
  const t = useT();
  const manifest = useDatasetStore((s) => s.manifest);
  const status = useDatasetStore((s) => s.status);
  let text: string;
  if (manifest) {
    text = t("about.dataVersion", {
      pack: `${manifest.pack.name} ${manifest.pack.version}`,
      cobblemon: manifest.cobblemonVersion,
    });
  } else {
    text = t(status === "error" ? "shell.dataUnavailable" : "shell.dataPending");
  }
  return <div className="sidebar-version">{text}</div>;
}

export function Sidebar() {
  const t = useT();
  const active = useNavigationStore((s) => navOwner(s.current.screen));
  const go = useNavigationStore((s) => s.go);
  return (
    <aside className="sidebar">
      <div className="brand">
        <PokedexLens size="md" />
        <div className="brand-name">{t("shell.brand")}</div>
      </div>
      <nav className="nav" aria-label={t("shell.brand")}>
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.screen}
              type="button"
              data-nav={item.screen}
              className={`nav-item${active === item.screen ? " active" : ""}`}
              aria-current={active === item.screen ? "page" : undefined}
              onClick={() => go(item.screen)}
            >
              <span className="ico">{Icon ? <Icon /> : <img src={pokeballUrl} alt="" />}</span>
              <span className="nav-label">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-foot">
        <div className="toggles">
          <SoundToggle />
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <DatasetVersion />
      </div>
    </aside>
  );
}

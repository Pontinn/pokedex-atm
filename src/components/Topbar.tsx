// Topbar do mobile, a moldura do "aparelho" (index.html:61-72 do prototipo): lente, LEDs, titulo e toggles.
import { useT } from "../i18n/useT";
import { PokedexLens } from "./PokedexLens";
import { LanguageToggle, SoundToggle } from "./ShellToggles";

export function Topbar() {
  const t = useT();
  return (
    <header className="topbar">
      <div className="topbar-shell">
        <PokedexLens size="sm" />
        <div className="topbar-title">{t("shell.brand")}</div>
        <div className="topbar-actions">
          <SoundToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

// Tab bar do mobile (index.html:241-247 do prototipo): Inicio, Dex, bola central Capturados, Comparar, Mais.
import pokeballUrl from "../assets/pokeball.webp";
import { useT } from "../i18n/useT";
import { useNavigationStore } from "../navigation/navigation-store";
import { useShellStore } from "../state/shell-store";
import { Ellipsis } from "./Icon";
import { MORE_ITEMS, SIDEBAR_ITEMS, TAB_SCREENS, navOwner } from "./nav-items";
import { playSfx } from "../audio/sfx";

const TAB_ITEMS = SIDEBAR_ITEMS.filter((i) => TAB_SCREENS.includes(i.screen));

export function TabBar() {
  const t = useT();
  const active = useNavigationStore((s) => navOwner(s.current.screen));
  const go = useNavigationStore((s) => s.go);
  const moreOpen = useShellStore((s) => s.moreOpen);
  const setMoreOpen = useShellStore((s) => s.setMoreOpen);
  const moreActive = moreOpen || MORE_ITEMS.some((i) => i.screen === active);
  return (
    <nav className="tabbar" aria-label={t("shell.brand")}>
      {TAB_ITEMS.map((item) => {
        const Icon = item.icon;
        const isBall = item.screen === "captured";
        return (
          <button
            key={item.screen}
            type="button"
            data-nav={item.screen}
            className={`tab${isBall ? " tab-ball" : ""}${active === item.screen && !moreOpen ? " active" : ""}`}
            aria-current={active === item.screen ? "page" : undefined}
            onClick={() => {
              setMoreOpen(false);
              go(item.screen);
            }}
          >
            <span className="ico">{Icon ? <Icon /> : <img src={pokeballUrl} alt="" />}</span>
            <span className="tab-label">{t(item.labelKey)}</span>
          </button>
        );
      })}
      <button
        type="button"
        data-nav="more"
        className={`tab tab-more${moreActive ? " active" : ""}`}
        aria-expanded={moreOpen}
        aria-haspopup="dialog"
        onClick={() => {
          playSfx("pokedex_click_short");
          setMoreOpen(!moreOpen);
        }}
      >
        <span className="ico">
          <Ellipsis />
        </span>
        <span className="tab-label">{t("nav.more")}</span>
      </button>
    </nav>
  );
}

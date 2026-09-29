// Sheet "Mais" do mobile (index.html:250-259 do prototipo): Treinadores, Pokebolas, Itens, Sincronizar, Configuracoes
// e, por ultimo, os links do portfolio e do GitHub (nova aba).
import { useEffect } from "react";
import { useT } from "../i18n/useT";
import { useNavigationStore } from "../navigation/navigation-store";
import { useShellStore } from "../state/shell-store";
import { ExternalLink, Github } from "./Icon";
import { GITHUB_URL, PORTFOLIO_URL, shortUrl } from "./MadeBy";
import { MORE_ITEMS, navOwner } from "./nav-items";

export function MoreSheet() {
  const t = useT();
  const open = useShellStore((s) => s.moreOpen);
  const setMoreOpen = useShellStore((s) => s.setMoreOpen);
  const active = useNavigationStore((s) => navOwner(s.current.screen));
  const go = useNavigationStore((s) => s.go);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setMoreOpen]);

  return (
    <div className={`sheet more-sheet${open ? " open" : ""}`} aria-hidden={!open} role="dialog" aria-label={t("nav.more")}>
      <div className="sheet-bg" data-silent="" onClick={() => setMoreOpen(false)} />
      <div className="sheet-panel">
        <div className="sheet-handle" />
        {MORE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.screen}
              type="button"
              data-nav={item.screen}
              tabIndex={open ? 0 : -1}
              className={`sheet-item${active === item.screen ? " active" : ""}`}
              onClick={() => {
                setMoreOpen(false);
                go(item.screen);
              }}
            >
              {Icon ? <Icon /> : null}
              <span className="sheet-item-label">{t(item.labelKey)}</span>
              {item.subKey ? <small className="sheet-item-sub">{t(item.subKey)}</small> : null}
            </button>
          );
        })}
        <a
          className="sheet-item sheet-item-portfolio"
          href={PORTFOLIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={open ? 0 : -1}
          aria-label={t("shell.madeByLabel")}
          data-portfolio=""
          onClick={() => setMoreOpen(false)}
        >
          <ExternalLink aria-hidden="true" />
          <span className="sheet-item-label">{t("shell.madeBy")}</span>
          <small className="sheet-item-sub">{shortUrl(PORTFOLIO_URL)}</small>
        </a>
        <a
          className="sheet-item sheet-item-portfolio"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={open ? 0 : -1}
          aria-label={t("shell.githubLabel")}
          data-github=""
          onClick={() => setMoreOpen(false)}
        >
          <Github aria-hidden="true" />
          <span className="sheet-item-label">{t("shell.github")}</span>
          <small className="sheet-item-sub">{shortUrl(GITHUB_URL)}</small>
        </a>
      </div>
    </div>
  );
}

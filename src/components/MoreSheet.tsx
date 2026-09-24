// Sheet "Mais" do mobile (index.html:250-259 do prototipo): Treinadores, Pokebolas, Itens, Sincronizar, Configuracoes.
import { useEffect } from "react";
import { useT } from "../i18n/useT";
import { useNavigationStore } from "../navigation/navigation-store";
import { useShellStore } from "../state/shell-store";
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
      </div>
    </div>
  );
}

// Lista do autocomplete (F2.1): .search-dd / .dd-item (prototipo style.css:353-359), sprite 96px local, #0025,
// nome no idioma da UI e chips sm. Sem resultado com texto -> estado vazio inline (RF-08).
import { memo } from "react";
import { TypeChip } from "../../components/TypeChip";
import type { SpeciesSummary } from "../../data/types";
import { gameName, useT } from "../../i18n/useT";
import { usePreferencesStore } from "../../state/preferences-store";
import pokeballUrl from "../../assets/pokeball.webp";
import { formatDex, SpeciesSprite } from "./SpeciesSprite";

export const SearchDropdown = memo(function SearchDropdown({
  id,
  open,
  query,
  results,
  active,
  onPick,
}: {
  id: string;
  open: boolean;
  query: string;
  results: SpeciesSummary[];
  active: number;
  onPick(dex: number): void;
}) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  return (
    <div className={`search-dd${open ? " open" : ""}`} id={id} role="listbox" aria-hidden={!open}>
      {open && results.length === 0 ? (
        <div className="dd-empty empty-state ob-none" role="status">
          <span className="ob-ico" aria-hidden="true">
            <img src={pokeballUrl} alt="" />
          </span>
          <p className="empty-state-text">{t("home.noResults", { q: query })}</p>
        </div>
      ) : null}
      {open
        ? results.map((s, i) => (
            <button
              key={s.dex}
              type="button"
              role="option"
              aria-selected={i === active}
              className={`dd-item${i === active ? " active" : ""}`}
              data-nav=""
              data-dex={s.dex}
              onClick={() => onPick(s.dex)}
            >
              <SpeciesSprite species={s} />
              <span className="dd-main">
                <span className="dex-num">{formatDex(s.dex)}</span>
                <span className="dd-name">{gameName(s, lang)}</span>
              </span>
              <span className="dd-types">
                {s.types.map((type) => (
                  <TypeChip key={type} type={type} lang={lang} size="sm" />
                ))}
              </span>
            </button>
          ))
        : null}
    </div>
  );
});

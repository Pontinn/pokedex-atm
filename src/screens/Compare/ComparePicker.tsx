// Escolha do Pokemon de um lado de Comparar (F7.1): MESMA busca da Home (visual .search + SearchDropdown, regra
// searchSpecies com nome PT/EN sem acento e numero), mas escolher troca o lado em vez de abrir a ficha.
import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { Search, X } from "../../components/Icon";
import { searchSpecies } from "../../domain/search";
import { useT } from "../../i18n/useT";
import { useDatasetStore } from "../../state/dataset-store";
import { SEARCH_DEBOUNCE_MS, SEARCH_LIMIT } from "../Home/SearchBox";
import { SearchDropdown } from "../Home/SearchDropdown";
import type { Side } from "./compare-model";

export function ComparePicker({ side, onPick, onClose }: { side: Side; onPick(dex: number): void; onClose(): void }) {
  const t = useT();
  const index = useDatasetStore((s) => s.speciesIndex);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  useEffect(() => {
    if (text === query) return undefined;
    const timer = setTimeout(() => setQuery(text), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, query]);

  const results = useMemo(() => (index ? searchSpecies(index, query, SEARCH_LIMIT) : []), [index, query]);
  const trimmed = query.trim();

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const now = index ? (text === query ? results : searchSpecies(index, text, SEARCH_LIMIT)) : [];
      const pick = now[Math.min(active, Math.max(now.length - 1, 0))];
      if (pick) onPick(pick.dex);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="search cmp-search" data-picker={side}>
      <span className="search-ico" aria-hidden="true">
        <Search />
      </span>
      <input
        id={`cmp-q-${side}`}
        type="text"
        role="combobox"
        aria-expanded={trimmed !== ""}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={t("compare.searchLabel")}
        autoComplete="off"
        spellCheck={false}
        autoFocus
        placeholder={t("home.searchPh")}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
      />
      <button type="button" className="search-btn cmp-search-close" aria-label={t("compare.close")} title={t("compare.close")} onClick={onClose}>
        <X aria-hidden="true" />
      </button>
      <SearchDropdown id={listId} open={trimmed !== "" && text.trim() !== ""} query={trimmed} results={results} active={active} onPick={onPick} />
    </div>
  );
}

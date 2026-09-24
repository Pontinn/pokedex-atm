// Busca da Home com autocomplete (F2.1; RF-05..08): nome PT/EN sem acento e numero ("25", "025", "0025", "#25"),
// via searchSpecies (B6.5). Texto guardado no ui da entrada de navegacao (volta restaurado); resultados com
// debounce de 120 ms; Enter/Buscar abre o 1o resultado; setas navegam; Esc fecha.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "../../components/Icon";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import { searchSpecies } from "../../domain/search";
import { useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useDatasetStore } from "../../state/dataset-store";
import { SearchDropdown } from "./SearchDropdown";

export const SEARCH_DEBOUNCE_MS = 120;
export const SEARCH_LIMIT = 8;

export function SearchBox() {
  const t = useT();
  const { navigate, updateUi } = useNavigationActions();
  const index = useDatasetStore((s) => s.speciesIndex);
  const initial = useScreenUi("home", "query");
  const [text, setText] = useState(initial);
  const [query, setQuery] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (text === query) return undefined;
    const timer = setTimeout(() => setQuery(text), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, query]);

  const results = useMemo(() => (index ? searchSpecies(index, query, SEARCH_LIMIT) : []), [index, query]);
  const trimmed = query.trim();
  const open = focused && trimmed !== "" && text.trim() !== "";

  const openDetail = useCallback(
    (dex: number) => {
      setFocused(false);
      navigate("detail", { dex });
    },
    [navigate],
  );

  const submit = () => {
    if (!index) return;
    // Enter nao espera o debounce: usa o texto atual
    const now = text === query ? results : searchSpecies(index, text, SEARCH_LIMIT);
    const pick = now[Math.min(active, Math.max(now.length - 1, 0))];
    if (pick) openDetail(pick.dex);
    else {
      setQuery(text);
      setFocused(true);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused(true);
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  };

  const loading = !index;
  return (
    <div
      ref={rootRef}
      className="search"
      id="search"
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <span className="search-ico" aria-hidden="true">
        {loading ? <PokeballSpinner size="sm" label={false} /> : <Search />}
      </span>
      <input
        id="search-input"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={t("home.searchLabel")}
        autoComplete="off"
        spellCheck={false}
        placeholder={t("home.searchPh")}
        disabled={loading}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setActive(0);
          updateUi({ query: e.target.value });
        }}
        onKeyDown={onKeyDown}
      />
      <button type="button" className="search-btn" disabled={loading} onClick={submit}>
        {t("home.search")}
      </button>
      <SearchDropdown id={listId} open={open} query={trimmed} results={results} active={active} onPick={openDetail} />
    </div>
  );
}

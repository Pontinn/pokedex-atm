// Barra de busca das telas de lista do grupo B (Treinadores, Pokebolas, Itens): MESMO visual da busca da Home
// (pilula .search), sem dropdown: filtra a lista da tela. O texto vive em current.ui.filters.query (restaura ao
// voltar) e sai com debounce de 120 ms (regra geral de Frontend da SPEC).
import { memo, useEffect, useState } from "react";
import { Search, X } from "../../components/Icon";
import { useT, type TranslationKey } from "../../i18n/useT";
import { useNavigationStore } from "../../navigation/navigation-store";
import "./list-search.css";

export const LIST_SEARCH_DEBOUNCE_MS = 120;

type UiWithFilters = { filters?: { query?: string } };

/** Texto da busca da tela atual (current.ui.filters.query). */
export function useListQuery(): string {
  return useNavigationStore((s) => (s.current.ui as UiWithFilters).filters?.query ?? "");
}

function writeListQuery(query: string): void {
  const store = useNavigationStore.getState();
  const prev = (store.current.ui as UiWithFilters).filters ?? {};
  // O UiStateMap congelado ainda nao declara `filters` para estas telas (pedido ao orquestrador); o patch e parcial.
  (store.updateUi as (patch: Record<string, unknown>) => void)({ filters: { ...prev, query } });
}

export interface ListSearchProps {
  id: string;
  labelKey: TranslationKey;
  placeholderKey: TranslationKey;
  clearKey: TranslationKey;
}

export const ListSearch = memo(function ListSearch({ id, labelKey, placeholderKey, clearKey }: ListSearchProps) {
  const t = useT();
  const stored = useListQuery();
  const [text, setText] = useState(stored);

  useEffect(() => {
    if (text === stored) return undefined;
    const timer = setTimeout(() => writeListQuery(text), LIST_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, stored]);

  return (
    <div className="search list-search" role="search">
      <span className="search-ico" aria-hidden="true">
        <Search />
      </span>
      <input
        id={id}
        type="search"
        aria-label={t(labelKey)}
        autoComplete="off"
        spellCheck={false}
        placeholder={t(placeholderKey)}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && text) {
            setText("");
            writeListQuery("");
          }
        }}
      />
      {text ? (
        <button
          type="button"
          className="search-btn list-search-clear"
          aria-label={t(clearKey)}
          title={t(clearKey)}
          onClick={() => {
            setText("");
            writeListQuery("");
          }}
        >
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

// Barra de busca das telas de lista do grupo B (Treinadores, Pokebolas, Itens): MESMO visual da busca da Home
// (pilula .search), sem dropdown: filtra a lista da tela. O texto vive no estado de UI da entrada atual (restaura ao
// voltar): `filters.query` em Treinadores/Pokebolas e `query` em Itens (UiStateMap). Debounce de 120 ms (regra geral
// de Frontend da SPEC).
import { memo, useEffect, useState } from "react";
import { Search, X } from "../../components/Icon";
import { useT, type TranslationKey } from "../../i18n/useT";
import { useNavigationStore } from "../../navigation/navigation-store";
import type { UiStateMap } from "../../navigation/types";
import "./list-search.css";

export const LIST_SEARCH_DEBOUNCE_MS = 120;

export type ListScreen = "trainers" | "balls" | "items";

function readQuery(ui: unknown, screen: ListScreen): string {
  if (screen === "items") return (ui as UiStateMap["items"]).query ?? "";
  return (ui as UiStateMap[typeof screen]).filters?.query ?? "";
}

/** Texto da busca da tela de lista atual. */
export function useListQuery(screen: ListScreen): string {
  return useNavigationStore((s) => readQuery(s.current.ui, screen));
}

function writeListQuery(screen: ListScreen, query: string): void {
  const { updateUi } = useNavigationStore.getState();
  if (screen === "items") updateUi<"items">({ query });
  else updateUi<typeof screen>({ filters: { query } });
}

export interface ListSearchProps {
  screen: ListScreen;
  id: string;
  labelKey: TranslationKey;
  placeholderKey: TranslationKey;
  clearKey: TranslationKey;
}

export const ListSearch = memo(function ListSearch({ screen, id, labelKey, placeholderKey, clearKey }: ListSearchProps) {
  const t = useT();
  const stored = useListQuery(screen);
  const [text, setText] = useState(stored);

  useEffect(() => {
    if (text === stored) return undefined;
    const timer = setTimeout(() => writeListQuery(screen, text), LIST_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, stored, screen]);

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
            writeListQuery(screen, "");
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
            writeListQuery(screen, "");
          }}
        >
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

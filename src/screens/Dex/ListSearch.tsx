// Barra de busca das telas de lista (F3.2 Pokedex, F6.2 Capturados; decisao do Pontin 2026-09-24): mesmo visual da
// busca da Home (.search), mas FILTRA a lista (sem dropdown). Numero ou nome PT/EN sem acento; debounce de 120 ms;
// o texto vive no estado de UI da entrada (restaura ao voltar). Botao limpar (x).
import { useEffect, useRef, useState } from "react";
import { Search, X } from "../../components/Icon";
import { useT } from "../../i18n/useT";
import type { MessageKey } from "../../i18n/messages";

export const LIST_SEARCH_DEBOUNCE_MS = 120;

export interface ListSearchProps {
  /** texto inicial (restaurado da pilha) */
  initial: string;
  /** chamado com o texto ja "debounced" */
  onQuery(query: string): void;
  placeholderKey: MessageKey;
  labelKey: MessageKey;
  id?: string;
}

export function ListSearch({ initial, onQuery, placeholderKey, labelKey, id }: ListSearchProps) {
  const t = useT();
  const [text, setText] = useState(initial);
  const last = useRef(initial);
  const onQueryRef = useRef(onQuery);
  onQueryRef.current = onQuery;

  useEffect(() => {
    if (text === last.current) return undefined;
    const timer = setTimeout(() => {
      last.current = text;
      onQueryRef.current(text);
    }, LIST_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const clear = () => {
    setText("");
    last.current = "";
    onQueryRef.current("");
  };

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
          if (e.key === "Escape" && text) clear();
        }}
      />
      {text ? (
        <button type="button" className="list-search-clear" aria-label={t("dex.clearSearch")} onClick={clear}>
          <X />
        </button>
      ) : null}
    </div>
  );
}

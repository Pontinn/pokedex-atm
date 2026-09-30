// Mensagens i18n do modulo "items". Dono: agente B (grade de itens: item).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const ITEMS_MESSAGES = {
  "item.search": { pt: "Buscar item...", en: "Search item..." },
  "item.how": { pt: "Como usar", en: "How to use" },
  "item.none": { pt: "Nenhum item encontrado.", en: "No item found." },
  "item.searchLabel": { pt: "Buscar item", en: "Search item" },
  "item.searchPh": { pt: "Buscar item (PT ou EN)", en: "Search item (PT or EN)" },
  "item.searchClear": { pt: "Limpar busca", en: "Clear search" },
  "item.tabs": { pt: "Categorias de itens", en: "Item categories" },
  "item.noDesc": { pt: "Sem descrição oficial neste item", en: "No official description for this item" },
  "item.expand": { pt: "Mostrar descrição completa", en: "Show full description" },
  "item.collapse": { pt: "Recolher descrição", en: "Collapse description" },
  "item.results": { pt: "{n} itens encontrados", en: "{n} items found" },
  "item.cat.ball": { pt: "Pokébolas", en: "Poké Balls" },
  "item.cat.fossil": { pt: "Fósseis", en: "Fossils" },
  "item.cat.mint": { pt: "Mentas", en: "Mints" },
  "item.cat.other": { pt: "Outros", en: "Other" },
  "item.origin.mutation": { pt: "Mutação", en: "Mutation" },
  "item.origin.world": { pt: "Mundo", en: "World" },
  "item.origin.all": { pt: "Todos", en: "All" },
  "item.origin.filter": { pt: "Filtrar bagas por origem", en: "Filter berries by origin" },
} as const satisfies Record<string, Message>;

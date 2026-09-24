// Mensagens i18n do modulo "items". Dono: agente B (grade de itens: item).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const ITEMS_MESSAGES = {
  "item.search": { pt: "Buscar item...", en: "Search item..." },
  "item.how": { pt: "Como usar", en: "How to use" },
  "item.none": { pt: "Nenhum item encontrado.", en: "No item found." },
} as const satisfies Record<string, Message>;

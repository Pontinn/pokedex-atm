// Mensagens i18n do modulo "compare". Dono: agente B (Comparar; reatribuido do A em 2026-09-24).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const COMPARE_MESSAGES = {
  "compare.vs": { pt: "VS", en: "VS" },
  "compare.swap": { pt: "Trocar lados", en: "Swap sides" },
  "compare.change": { pt: "Trocar Pokémon", en: "Change Pokémon" },
  "compare.total": { pt: "Total", en: "Total" },
  "compare.pick": { pt: "Escolha um Pokémon", en: "Choose a Pokémon" },
  "compare.searchLabel": { pt: "Buscar Pokémon para comparar", en: "Search Pokémon to compare" },
  "compare.close": { pt: "Fechar busca", en: "Close search" },
} as const satisfies Record<string, Message>;

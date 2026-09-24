// Mensagens i18n do modulo "compare". Dono: agente A (Comparar).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const COMPARE_MESSAGES = {
  "compare.vs": { pt: "VS", en: "VS" },
  "compare.swap": { pt: "Trocar lados", en: "Swap sides" },
  "compare.change": { pt: "Trocar Pokémon", en: "Change Pokémon" },
  "compare.total": { pt: "Total", en: "Total" },
} as const satisfies Record<string, Message>;

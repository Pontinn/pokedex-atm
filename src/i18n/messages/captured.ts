// Mensagens i18n do modulo "captured". Dono: agente A (Capturados).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const CAPTURED_MESSAGES = {
  "captured.recent": { pt: "Recentes", en: "Recent" },
  "captured.on": { pt: "Capturado em", en: "Caught on" },
  "captured.of": { pt: "de", en: "of" },
  "captured.percent": { pt: "{pct} da Pontindex", en: "{pct} of the Pontindex" },
  "captured.tabs": { pt: "Filtrar capturados", en: "Filter caught list" },
  "captured.tabAll": { pt: "Todos capturados", en: "All caught" },
  "captured.tabMissing": { pt: "Só faltando", en: "Missing only" },
  "captured.searchPh": { pt: "Filtrar por nome ou número (PT ou EN)", en: "Filter by name or number (PT or EN)" },
  "captured.searchLabel": { pt: "Filtrar os capturados", en: "Filter the caught list" },
  "captured.unmark": { pt: "Desmarcar", en: "Unmark" },
  "captured.none": { pt: "Nenhum Pokémon capturado ainda.", en: "No Pokémon caught yet." },
  "captured.openDex": { pt: "Abrir a Pokédex", en: "Open the Pokédex" },
  "captured.complete": { pt: "Você completou a Pontindex!", en: "You completed the Pontindex!" },
  "captured.noneQuery": { pt: "Nenhum Pokémon encontrado para", en: "No Pokémon found for" },
} as const satisfies Record<string, Message>;

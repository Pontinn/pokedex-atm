// Mensagens i18n do modulo "dex". Dono: agente A (Pokedex).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const DEX_MESSAGES = {
  "dex.results": { pt: "resultados", en: "results" },
  "dex.type": { pt: "Tipo", en: "Type" },
  "dex.gen": { pt: "Geração", en: "Generation" },
  "dex.evo": { pt: "Evolução", en: "Evolution" },
  "dex.sort": { pt: "Ordenar", en: "Sort" },
  "dex.status": { pt: "Status", en: "Status" },
  "dex.all": { pt: "Todos", en: "All" },
  "dex.onlyCaught": { pt: "Só capturados", en: "Caught only" },
  "dex.onlyMissing": { pt: "Só faltando", en: "Missing only" },
  "dex.byNum": { pt: "Número", en: "Number" },
  "dex.byName": { pt: "Nome", en: "Name" },
  "dex.byBst": { pt: "Total de atributos", en: "Base stat total" },
  "dex.none": { pt: "Nenhum Pokémon com esses filtros.", en: "No Pokémon match these filters." },
} as const satisfies Record<string, Message>;

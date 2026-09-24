// Mensagens i18n do modulo "home". Dono: agente A (Home).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const HOME_MESSAGES = {
  "home.eyebrow": { pt: "All the Mons · Cobblemon", en: "All the Mons · Cobblemon" },
  "home.title": { pt: "Qual Pokémon você procura?", en: "Which Pokémon are you looking for?" },
  "home.searchPh": { pt: "Buscar por nome ou número da Pokédex...", en: "Search by name or Pokédex number..." },
  "home.search": { pt: "Buscar", en: "Search" },
  "home.random": { pt: "Pokémon aleatório", en: "Random Pokémon" },
  "home.openDex": { pt: "Abrir Pokédex", en: "Open Pokédex" },
  "home.randomShort": { pt: "Aleatório", en: "Random" },
  "home.openDexShort": { pt: "Pokédex", en: "Pokédex" },
  "home.caught": { pt: "Capturados", en: "Caught" },
  "home.seeAll": { pt: "Ver todos", en: "See all" },
  "home.of": { pt: "de", en: "of" },
  "home.team": { pt: "Meu time", en: "My team" },
  "home.empty": { pt: "Vazio", en: "Empty" },
  "home.history": { pt: "Histórico", en: "History" },
  "home.historyHint": { pt: "Últimos 20 consultados", en: "Last 20 viewed" },
} as const satisfies Record<string, Message>;

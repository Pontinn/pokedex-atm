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
  // F2.1 (busca)
  "home.searchLabel": { pt: "Buscar Pokémon", en: "Search Pokémon" },
  "home.noResults": { pt: "Nenhum Pokémon encontrado para \"{q}\"", en: "No Pokémon found for \"{q}\"" },
  // F2.2 (time, historico, capturados)
  "home.teamFull": { pt: "Time cheio: 6 de 6 posições ocupadas", en: "Team is full: 6 of 6 slots taken" },
  "home.teamFullOrphans": {
    pt: "6 posições ocupadas (algumas de outra versão do dataset)",
    en: "6 slots taken (some from another dataset version)",
  },
  "home.removeFromTeam": { pt: "Remover {name} do time", en: "Remove {name} from team" },
  "home.removed": { pt: "{name} removido do time", en: "{name} removed from team" },
  "home.undo": { pt: "Desfazer", en: "Undo" },
  "home.historyEmpty": {
    pt: "Nenhum Pokémon consultado ainda. Abra uma ficha e ela aparece aqui.",
    en: "No Pokémon viewed yet. Open an entry and it shows up here.",
  },
} as const satisfies Record<string, Message>;

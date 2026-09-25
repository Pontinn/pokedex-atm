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
  "dex.noneQuery": { pt: "Nenhum Pokémon encontrado para \"{q}\" com esses filtros.", en: "No Pokémon found for \"{q}\" with these filters." },
  "dex.searchPh": { pt: "Filtrar por nome ou número (PT ou EN)", en: "Filter by name or number (PT or EN)" },
  "dex.searchLabel": { pt: "Filtrar a Pokédex", en: "Filter the Pokédex" },
  "dex.clearSearch": { pt: "Limpar busca", en: "Clear search" },
  "dex.genN": { pt: "Geração {n}", en: "Generation {n}" },
  "dex.genCustom": { pt: "Do pack (All the Mons)", en: "From the pack (All the Mons)" },
  "dex.evoMethod.level": { pt: "Nível", en: "Level" },
  "dex.evoMethod.item": { pt: "Item", en: "Item" },
  "dex.evoMethod.friendship": { pt: "Amizade", en: "Friendship" },
  "dex.evoMethod.trade": { pt: "Troca", en: "Trade" },
  "dex.evoMethod.move": { pt: "Golpe", en: "Move" },
  "dex.evoMethod.other": { pt: "Outro", en: "Other" },
  "dex.evoMethod.none": { pt: "Não evolui", en: "Does not evolve" },
} as const satisfies Record<string, Message>;

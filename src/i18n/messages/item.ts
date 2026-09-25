// Mensagens i18n do modulo "item". Dono: agente B (pagina do item: ip).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const ITEM_MESSAGES = {
  "ip.back": { pt: "Voltar", en: "Back" },
  "ip.obtain": { pt: "Como obter", en: "How to obtain" },
  "ip.craft": { pt: "Craftável", en: "Craftable" },
  "ip.craftYes": { pt: "Sim, tem receita", en: "Yes, it has a recipe" },
  "ip.drop": { pt: "Drop de Pokémon", en: "Pokémon drop" },
  "ip.plant": { pt: "Plantável", en: "Plantable" },
  "ip.plantText": { pt: "Cresce nos biomas:", en: "Grows in biomes:" },
  "ip.loot": { pt: "Loot de estrutura", en: "Structure loot" },
  "ip.fish": { pt: "Pesca", en: "Fishing" },
  "ip.fishText": { pt: "Pode vir na vara de pescar", en: "Can be reeled in while fishing" },
  "ip.buy": { pt: "Compra / NPC", en: "Purchase / NPC" },
  "ip.used": { pt: "Usado em", en: "Used in" },
  "ip.evolves": { pt: "Evolui", en: "Evolves" },
  "ip.mult": { pt: "Multiplicador de captura", en: "Catch multiplier" },
  "ip.effect": { pt: "Efeito", en: "Effect" },
  "ip.form": { pt: "Forma", en: "Form" },
  "ip.revive": { pt: "Reviver na máquina de fósseis", en: "Revive in the fossil machine" },
  "ip.craftTypes": { pt: "Sim, tem receita ({types})", en: "Yes, it has a recipe ({types})" },
  "ip.plantAny": { pt: "Pode ser plantado", en: "Can be planted" },
  "ip.otherMod": { pt: "Item de outro mod", en: "Item from another mod" },
  "ip.otherModHint": { pt: "Este item vem de outro mod do pack e não tem dados no Cobblemon.", en: "This item comes from another mod in the pack and has no Cobblemon data." },
  "ip.cookingPending": { pt: "Efeito numérico ainda não confirmado; descrição oficial acima", en: "Numeric effect not confirmed yet; official description above" },
  "ip.openEntry": { pt: "Abrir ficha de {name}", en: "Open {name} entry" },
} as const satisfies Record<string, Message>;

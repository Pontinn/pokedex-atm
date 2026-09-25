// Regras de exibicao da pagina do item (F9.3), puras e testaveis com o dataset real.
import type { ItemInfo, ItemObtainRoute, LocalizedText } from "../../data/types";
import { humanizeId } from "../Trainers/trainer-model";

/** Rota "sem rota" quando o item nao tem nenhuma rota conhecida (RF-69). */
export function obtainRows(item: Pick<ItemInfo, "obtain"> | null): ItemObtainRoute[] {
  const rows = (item?.obtain ?? []).filter((r) => r.kind !== "none");
  return rows.length ? rows : [{ kind: "none" }];
}

const RECIPE_LABELS: ReadonlyArray<[RegExp, LocalizedText]> = [
  [/crafting_/, { pt: "Bancada de trabalho", en: "Crafting table" }],
  [/:smelting$/, { pt: "Fornalha", en: "Furnace" }],
  [/:blasting$/, { pt: "Alto-forno", en: "Blast furnace" }],
  [/:smoking$/, { pt: "Defumador", en: "Smoker" }],
  [/:campfire_cooking$/, { pt: "Fogueira", en: "Campfire" }],
  [/:stonecutting$/, { pt: "Cortador de pedras", en: "Stonecutter" }],
  [/:smithing/, { pt: "Mesa de ferraria", en: "Smithing table" }],
  [/brewing_stand$/, { pt: "Suporte de poções", en: "Brewing stand" }],
  [/cooking_pot/, { pt: "Panela de cozinha", en: "Cooking pot" }],
];

/** Tipos de receita legiveis e sem repeticao (nunca a receita em si, RF-68). */
export function recipeLabels(types: readonly string[], lang: "pt" | "en"): string[] {
  const out: string[] = [];
  for (const type of types) {
    const hit = RECIPE_LABELS.find(([re]) => re.test(type));
    const label = hit ? hit[1][lang] : humanizeId(type);
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

/** Nome legivel de uma tabela de loot ("ruins/gilded_chests/base" -> "Ruins: Gilded chests (base)"). */
export function lootTableLabel(table: string): string {
  const parts = table.replace(/^[a-z0-9_]+:/, "").split("/").filter(Boolean);
  const words = parts.map((p) => p.replace(/_/g, " "));
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (words.length === 1) return cap(words[0]!);
  const last = words[words.length - 1]!;
  const head = words.slice(0, -1).map(cap).join(": ");
  return `${head} (${last})`;
}

/** Tabelas humanizadas sem repeticao. */
export function lootLabels(tables: readonly string[]): string[] {
  return [...new Set(tables.map(lootTableLabel))];
}

/** Item citado mas fora do items.json (ex. minecraft:gunpowder): pagina minima com o id humanizado. */
export function unknownItemName(id: string): LocalizedText {
  const name = humanizeId(id);
  return { pt: name, en: name };
}

/** "Efeito" em Usado em: descricao oficial de itens de cura, cozinha e berries (prototipo itemPageBodyHTML). */
export function showsEffect(item: Pick<ItemInfo, "category" | "description">): boolean {
  return item.description != null && (item.category === "medicine" || item.category === "cooking" || item.category === "berry");
}

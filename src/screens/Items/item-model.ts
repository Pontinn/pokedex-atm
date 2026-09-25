// Regras de exibicao da grade de itens (F9.2), puras e testaveis com o dataset real.
import type { ItemCategory, ItemInfo } from "../../data/types";
import type { MessageKey } from "../../i18n/messages";
import { normalizeSearch } from "../../domain/normalize";

/** Ordem das abas (SPEC F9.2). */
export const ITEM_TABS: readonly ItemCategory[] = [
  "medicine",
  "vitamin",
  "ivCandy",
  "expCandy",
  "evolution",
  "held",
  "battle",
  "mint",
  "cooking",
  "berry",
  "bait",
  "ball",
  "fossil",
  "other",
];

/** Sufixo da classe de cor do prototipo (`cat-med`, `cat-iv`, ...; style.css 914-915). */
export const CATEGORY_CLASS: Readonly<Record<ItemCategory, string>> = {
  medicine: "med",
  ivCandy: "iv",
  vitamin: "vit",
  expCandy: "candy",
  evolution: "evo",
  held: "held",
  battle: "battle",
  cooking: "cook",
  berry: "berry",
  bait: "bait",
  ball: "ball",
  fossil: "fossil",
  mint: "mint",
  other: "other",
};

/** Rotulo da categoria (aba e tag do card). */
export const CATEGORY_LABEL: Readonly<Record<ItemCategory, MessageKey>> = {
  medicine: "cat.med",
  ivCandy: "cat.iv",
  vitamin: "cat.vit",
  expCandy: "cat.candy",
  evolution: "cat.evo",
  held: "cat.held",
  battle: "cat.battle",
  cooking: "cat.cook",
  berry: "cat.berry",
  bait: "cat.bait",
  ball: "item.cat.ball",
  fossil: "item.cat.fossil",
  mint: "item.cat.mint",
  other: "item.cat.other",
};

export function isItemCategory(v: unknown): v is ItemCategory {
  return typeof v === "string" && (ITEM_TABS as readonly string[]).includes(v);
}

/** Item pertence a aba: pela categoria; a aba "Iscas" tambem junta os itens com a tag `bait` (B4.1). */
export function inTab(item: Pick<ItemInfo, "category" | "tags">, tab: ItemCategory): boolean {
  return item.category === tab || (tab === "bait" && item.tags.includes("bait"));
}

/** Abas com pelo menos 1 item no dataset, na ordem da SPEC. */
export function visibleTabs(items: readonly ItemInfo[]): ItemCategory[] {
  return ITEM_TABS.filter((tab) => items.some((it) => inTab(it, tab)));
}

/** Aba efetiva: a salva se existir, senao a primeira com itens. */
export function effectiveTab(saved: unknown, tabs: readonly ItemCategory[]): ItemCategory | null {
  return isItemCategory(saved) && tabs.includes(saved) ? saved : (tabs[0] ?? null);
}

/**
 * Com texto: TODOS os itens cujo nome PT ou EN contem o texto (sem acento, RF-67), ignorando a aba.
 * Sem texto: os itens da aba. Ordem alfabetica pelo nome no idioma do card.
 */
export function filterItems(items: readonly ItemInfo[], tab: ItemCategory | null, query: string, lang: "pt" | "en"): ItemInfo[] {
  const q = normalizeSearch(query);
  const list = q
    ? items.filter((it) => normalizeSearch(`${it.name.pt} ${it.name.en}`).includes(q))
    : tab
      ? items.filter((it) => inTab(it, tab))
      : [];
  const key = (it: ItemInfo) => it.name[lang] || it.name.en || it.id;
  return list.sort((a, b) => key(a).localeCompare(key(b), lang === "pt" ? "pt-BR" : "en"));
}

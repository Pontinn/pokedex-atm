// Tipos da pilha de navegacao propria (F1.3, RF-01..RF-04).
import type { TypeId } from "../data/types";

export type ScreenId =
  | "home"
  | "dex"
  | "detail"
  | "captured"
  | "compare"
  | "trainers"
  | "balls"
  | "items"
  | "item"
  | "settings"
  | "sync";

export const SCREEN_IDS: readonly ScreenId[] = [
  "home",
  "dex",
  "detail",
  "captured",
  "compare",
  "trainers",
  "balls",
  "items",
  "item",
  "settings",
  "sync",
];

export interface ScreenParamsMap {
  home: Record<string, never>;
  dex: Record<string, never>;
  detail: { dex: number };
  captured: Record<string, never>;
  compare: { left?: number; right?: number };
  trainers: Record<string, never>;
  balls: Record<string, never>;
  items: Record<string, never>;
  item: { itemId: string };
  settings: Record<string, never>;
  sync: Record<string, never>;
}

export type DetailMoveTab = "level" | "tm" | "egg" | "tutor";
export type WeakFilter = "all" | "weak" | "res";
export type DexStatusFilter = "all" | "caught" | "missing";
export type DexSort = "num" | "name" | "bst";

export interface DexFilters {
  types: TypeId[];
  generation: string | null;
  evolution: string | null;
  query: string;
}

/** Busca das telas de lista (Treinadores, Pokebolas): texto em `ui.filters.query`, restaura ao voltar. */
export interface ListFilters {
  query: string;
}

export interface UiStateMap {
  home: { query: string };
  dex: { filters: DexFilters; sort: DexSort; status: DexStatusFilter };
  detail: {
    moveTab: DetailMoveTab;
    formIndex: number;
    weakFilter: WeakFilter;
    shiny: boolean;
    openMoveRows: string[];
    calcOpen: boolean;
    calcInputs: Record<string, number | string>;
  };
  captured: { tab: string };
  compare: { left: number | null; right: number | null };
  trainers: { seriesId: string | null; openTrainerId: string | null; filters: ListFilters };
  balls: { filter: string; filters: ListFilters };
  items: { category: string; query: string; openItemId: string | null };
  item: Record<string, never>;
  settings: { openCard: string | null };
  sync: { mode: "generate" | "receive" | null };
}

export type ScreenParams = ScreenParamsMap[ScreenId];
export type UiState = UiStateMap[ScreenId];

export interface NavEntry<S extends ScreenId = ScreenId> {
  id: number;
  screen: S;
  params: ScreenParamsMap[S];
  ui: UiStateMap[S];
  /** scrollTop de #main quando a entrada saiu do topo da pilha */
  scroll: number;
}

/** Estado de UI padrao de cada tela (nova entrada de navegacao). */
export function defaultUi<S extends ScreenId>(screen: S): UiStateMap[S] {
  const defaults: { [K in ScreenId]: () => UiStateMap[K] } = {
    home: () => ({ query: "" }),
    dex: () => ({ filters: { types: [], generation: null, evolution: null, query: "" }, sort: "num", status: "all" }),
    detail: () => ({
      moveTab: "level",
      formIndex: 0,
      weakFilter: "all",
      shiny: false,
      openMoveRows: [],
      calcOpen: false,
      calcInputs: {},
    }),
    captured: () => ({ tab: "all" }),
    compare: () => ({ left: null, right: null }),
    trainers: () => ({ seriesId: null, openTrainerId: null, filters: { query: "" } }),
    balls: () => ({ filter: "all", filters: { query: "" } }),
    items: () => ({ category: "all", query: "", openItemId: null }),
    item: () => ({}),
    settings: () => ({ openCard: null }),
    sync: () => ({ mode: null }),
  };
  return defaults[screen]() as UiStateMap[S];
}

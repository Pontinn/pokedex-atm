// Dicionario i18n PT/EN (F1.2). Porta as chaves do prototipo (design/prototipo/app.js:13-268), exceto as de
// texto fake (detail.noSpawn*, evo.methods, captured.progress/gen1, home.lastCaught, ip.noDesc) e as evo.<pedra>
// (nomes de item vem do dataset). Chaves theme.* usam os ids de THEME_IDS. Interpolacao: {n}, {v} etc.
// src/i18n/ e o UNICO lugar do app com strings de UI (regra pontindex/no-literal-jsx-text).

// Agregador (congelado apos F1.4): as chaves vivem em src/i18n/messages/<modulo>.ts, um modulo por dono.
import { CORE_MESSAGES } from "./messages/core";
import { HOME_MESSAGES } from "./messages/home";
import { DEX_MESSAGES } from "./messages/dex";
import { DETAIL_MESSAGES } from "./messages/detail";
import { CAPTURE_MESSAGES } from "./messages/capture";
import { CAPTURED_MESSAGES } from "./messages/captured";
import { COMPARE_MESSAGES } from "./messages/compare";
import { TRAINERS_MESSAGES } from "./messages/trainers";
import { BALLS_MESSAGES } from "./messages/balls";
import { ITEMS_MESSAGES } from "./messages/items";
import { ITEM_MESSAGES } from "./messages/item";
import { SETTINGS_MESSAGES } from "./messages/settings";
import { SYNC_MESSAGES } from "./messages/sync";

export type { Message } from "./messages/types";

/** Modulos por dono, na ordem de mesclagem (o teste de completude confere que nenhuma chave se repete). */
export const MESSAGE_MODULES = {
  core: CORE_MESSAGES,
  home: HOME_MESSAGES,
  dex: DEX_MESSAGES,
  detail: DETAIL_MESSAGES,
  capture: CAPTURE_MESSAGES,
  captured: CAPTURED_MESSAGES,
  compare: COMPARE_MESSAGES,
  trainers: TRAINERS_MESSAGES,
  balls: BALLS_MESSAGES,
  items: ITEMS_MESSAGES,
  item: ITEM_MESSAGES,
  settings: SETTINGS_MESSAGES,
  sync: SYNC_MESSAGES,
} as const;

export const MESSAGES = {
  ...CORE_MESSAGES,
  ...HOME_MESSAGES,
  ...DEX_MESSAGES,
  ...DETAIL_MESSAGES,
  ...CAPTURE_MESSAGES,
  ...CAPTURED_MESSAGES,
  ...COMPARE_MESSAGES,
  ...TRAINERS_MESSAGES,
  ...BALLS_MESSAGES,
  ...ITEMS_MESSAGES,
  ...ITEM_MESSAGES,
  ...SETTINGS_MESSAGES,
  ...SYNC_MESSAGES,
} as const;

export type MessageKey = keyof typeof MESSAGES;

/** Chaves do prototipo removidas de proposito (texto fake ou dado que vem do dataset). */
export const EXCLUDED_MESSAGE_KEYS = ["detail.noSpawn","detail.noSpawnDesc","evo.methods","captured.progress","captured.gen1","home.lastCaught","ip.noDesc","evo.fireStone","evo.thunderStone","evo.waterStone","evo.leafStone","evo.iceStone","evo.linkCable"] as const;

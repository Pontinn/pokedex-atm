// Padroes dos documentos (SPEC 5.3 e 2b) e versao atual do esquema dos documentos (RF-96).
import { THEME_IDS } from "../styles/themes";
import type { DocKey, DocMap } from "./types";

export const CURRENT_SCHEMA_VERSION = 1;

export const DOC_KEYS: readonly DocKey[] = ["captured", "team", "history", "trainerProgress", "preferences", "meta"];

/** Chaves de dados do usuario (tudo menos meta). */
export const USER_DOC_KEYS = ["captured", "team", "history", "trainerProgress", "preferences"] as const;
export type UserDocKey = (typeof USER_DOC_KEYS)[number];

// Injetada pelo Vite/Vitest (define); declarada aqui porque o tsconfig.node (testes) nao inclui vite-env.d.ts.
declare const __APP_VERSION__: string | undefined;

export function appVersion(): string {
  return typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "0.0.0";
}

export const DOC_DEFAULTS: { readonly [K in Exclude<DocKey, "meta">]: DocMap[K] } = {
  captured: { schemaVersion: 1, entries: {} },
  team: { schemaVersion: 1, slots: [null, null, null, null, null, null] },
  history: { schemaVersion: 1, entries: [] },
  trainerProgress: {
    schemaVersion: 1,
    activeSeriesId: null,
    freeroam: { active: false, pausedSeriesId: null },
    series: {},
  },
  preferences: {
    schemaVersion: 1,
    theme: THEME_IDS[0],
    uiLanguage: "pt",
    termsLanguage: "pt",
    termsOverrides: {},
    soundEnabled: true,
    // null = seguir prefers-reduced-motion do sistema (RF-93)
    reduceMotion: null,
  },
};

export function defaultMeta(now: number = Date.now()): DocMap["meta"] {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: now,
    lastWriteAt: now,
    datasetVersionSeen: null,
    appVersion: appVersion(),
  };
}

/** Copia nova (nunca compartilha referencia com DOC_DEFAULTS). */
export function defaultDoc<K extends DocKey>(key: K, now: number = Date.now()): DocMap[K] {
  if (key === "meta") return defaultMeta(now) as DocMap[K];
  return structuredClone(DOC_DEFAULTS[key as Exclude<DocKey, "meta">]) as DocMap[K];
}

export function defaultDocs(now: number = Date.now()): DocMap {
  return {
    captured: defaultDoc("captured"),
    team: defaultDoc("team"),
    history: defaultDoc("history"),
    trainerProgress: defaultDoc("trainerProgress"),
    preferences: defaultDoc("preferences"),
    meta: defaultMeta(now),
  };
}

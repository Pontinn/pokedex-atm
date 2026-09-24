// Leitura defensiva (SPEC 5.3): zod valida; se falhar, repara campo a campo; se irreparavel, o chamador isola o doc.
import { z } from "zod";
import { THEME_IDS } from "../styles/themes";
import { HISTORY_LIMIT } from "../domain/history";
import { normalizeTeam, TEAM_SIZE } from "../domain/team";
import { DOC_DEFAULTS, defaultMeta } from "./defaults";
import type { DocKey, DocMap } from "./types";

const lang = z.enum(["pt", "en"]);
const ts = z.number().finite();
const dexKey = /^[1-9]\d*$/;

export const docSchemas = {
  captured: z.object({
    schemaVersion: z.literal(1),
    entries: z.record(z.string().regex(dexKey), z.object({ capturedAt: ts })),
  }),
  team: z.object({
    schemaVersion: z.literal(1),
    slots: z.array(z.number().int().positive().nullable()).length(TEAM_SIZE),
  }),
  history: z.object({
    schemaVersion: z.literal(1),
    entries: z.array(z.object({ dex: z.number().int().positive(), viewedAt: ts })).max(HISTORY_LIMIT),
  }),
  trainerProgress: z.object({
    schemaVersion: z.literal(1),
    activeSeriesId: z.string().nullable(),
    freeroam: z.object({ active: z.boolean(), pausedSeriesId: z.string().nullable() }),
    series: z.record(z.string(), z.object({ defeated: z.record(z.string(), z.object({ at: ts })) })),
  }),
  preferences: z.object({
    schemaVersion: z.literal(1),
    theme: z.enum(THEME_IDS),
    uiLanguage: lang,
    termsLanguage: lang,
    termsOverrides: z.record(z.string(), lang),
    soundEnabled: z.boolean(),
    reduceMotion: z.boolean().nullable(),
  }),
  meta: z.object({
    schemaVersion: z.number().int().nonnegative(),
    createdAt: ts,
    lastWriteAt: ts,
    datasetVersionSeen: z.string().nullable(),
    appVersion: z.string(),
  }),
} as const;

export type ValidateResult<K extends DocKey> =
  | { ok: true; doc: DocMap[K]; repaired: boolean }
  | { ok: false; reason: string };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isPosInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0;

/** Repara o que der; retorna null quando a estrutura principal nao existe (irreparavel). */
const repairers: { [K in DocKey]: (raw: Obj) => unknown } = {
  captured(raw) {
    if (!isObj(raw.entries)) return null;
    const entries: Record<string, { capturedAt: number }> = {};
    for (const [k, v] of Object.entries(raw.entries)) {
      if (dexKey.test(k) && isObj(v) && isNum(v.capturedAt)) entries[k] = { capturedAt: v.capturedAt };
    }
    return { schemaVersion: 1, entries };
  },
  team(raw) {
    if (!Array.isArray(raw.slots)) return null;
    return { schemaVersion: 1, slots: normalizeTeam(raw.slots as (number | null)[]) };
  },
  history(raw) {
    if (!Array.isArray(raw.entries)) return null;
    const seen = new Set<number>();
    const entries: { dex: number; viewedAt: number }[] = [];
    for (const e of raw.entries) {
      if (isObj(e) && isPosInt(e.dex) && isNum(e.viewedAt) && !seen.has(e.dex)) {
        seen.add(e.dex);
        entries.push({ dex: e.dex, viewedAt: e.viewedAt });
      }
    }
    return { schemaVersion: 1, entries: entries.slice(0, HISTORY_LIMIT) };
  },
  trainerProgress(raw) {
    if (!isObj(raw.series)) return null;
    const series: Record<string, { defeated: Record<string, { at: number }> }> = {};
    for (const [sid, s] of Object.entries(raw.series)) {
      if (!isObj(s) || !isObj(s.defeated)) continue;
      const defeated: Record<string, { at: number }> = {};
      for (const [tid, d] of Object.entries(s.defeated)) if (isObj(d) && isNum(d.at)) defeated[tid] = { at: d.at };
      series[sid] = { defeated };
    }
    const fr = isObj(raw.freeroam) ? raw.freeroam : {};
    return {
      schemaVersion: 1,
      activeSeriesId: typeof raw.activeSeriesId === "string" ? raw.activeSeriesId : null,
      freeroam: {
        active: typeof fr.active === "boolean" ? fr.active : false,
        pausedSeriesId: typeof fr.pausedSeriesId === "string" ? fr.pausedSeriesId : null,
      },
      series,
    };
  },
  preferences(raw) {
    const d = DOC_DEFAULTS.preferences;
    const pick = <T>(schema: z.ZodType<T>, v: unknown, fallback: T): T => {
      const r = schema.safeParse(v);
      return r.success ? r.data : fallback;
    };
    const overrides: Record<string, "pt" | "en"> = {};
    if (isObj(raw.termsOverrides)) {
      for (const [k, v] of Object.entries(raw.termsOverrides)) if (v === "pt" || v === "en") overrides[k] = v;
    }
    return {
      schemaVersion: 1,
      theme: pick(z.enum(THEME_IDS), raw.theme, d.theme),
      uiLanguage: pick(lang, raw.uiLanguage, d.uiLanguage),
      termsLanguage: pick(lang, raw.termsLanguage, d.termsLanguage),
      termsOverrides: overrides,
      soundEnabled: pick(z.boolean(), raw.soundEnabled, d.soundEnabled),
      reduceMotion: pick(z.boolean().nullable(), raw.reduceMotion, d.reduceMotion),
    };
  },
  meta(raw) {
    if (!isNum(raw.schemaVersion) || !Number.isInteger(raw.schemaVersion) || raw.schemaVersion < 0) return null;
    const d = defaultMeta(0);
    return {
      schemaVersion: raw.schemaVersion,
      createdAt: isNum(raw.createdAt) ? raw.createdAt : d.createdAt,
      lastWriteAt: isNum(raw.lastWriteAt) ? raw.lastWriteAt : d.lastWriteAt,
      datasetVersionSeen: typeof raw.datasetVersionSeen === "string" ? raw.datasetVersionSeen : null,
      appVersion: typeof raw.appVersion === "string" ? raw.appVersion : d.appVersion,
    };
  },
};

export function validateDoc<K extends DocKey>(key: K, raw: unknown): ValidateResult<K> {
  const schema = docSchemas[key] as unknown as z.ZodType<DocMap[K]>;
  const first = schema.safeParse(raw);
  if (first.success) return { ok: true, doc: first.data, repaired: false };
  if (!isObj(raw)) return { ok: false, reason: `${key}: not an object` };
  const repaired = repairers[key](raw);
  const second = schema.safeParse(repaired);
  if (second.success) return { ok: true, doc: second.data, repaired: true };
  return { ok: false, reason: `${key}: ${first.error.issues[0]?.message ?? "invalid"}` };
}

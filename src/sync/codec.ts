// Codec binario do codigo de sincronizacao (SPEC 5.4.1): payload little-endian -> deflate-raw (fflate) ->
// + crc32 u32 LE -> base64url, prefixo "PDX1.". Decode segue a ordem exata de verificacao da SPEC; erro => nada escrito.
import { deflateSync, Inflate } from "fflate";
import { CURRENT_SCHEMA_VERSION, DOC_DEFAULTS } from "../storage/defaults";
import { crc32 } from "../storage/crc32";
import { applyMigrations, type Migration } from "../storage/migrations";
import { createV1FromPrototypeMigration } from "../storage/migrations/v1-from-prototype-localstorage";
import { normalizeTeam, TEAM_SIZE } from "../domain/team";
import { HISTORY_LIMIT } from "../domain/history";
import { THEME_IDS } from "../styles/themes";
import type { DocMap } from "../storage/types";
import { splitFrames } from "./frames";
import { summarize } from "./summary";
import {
  MAX_COMPRESSED_BYTES,
  MAX_INFLATED_BYTES,
  MAX_TEXT_LENGTH,
  SUPPORTED_SYNC_VERSION,
  SYNC_PREFIX,
  FRAME_PREFIX,
  FRAME_CAPACITY,
  SyncError,
  type Result,
  type SyncDecoded,
  type SyncEncoded,
  type UserDocs,
} from "./types";

/** Maior dex "normal" coberto pelo bitmap por padrao (1025 hoje); dex acima disso (9901, 9902) vao na lista custom. */
export const DEFAULT_MAX_DEX = 1025;
/** Dex a partir do qual a especie e sempre "custom" (fora do bitmap). */
const CUSTOM_DEX_START = 9000;
// "__proto__" fica de fora: como chave de objeto ele troca o prototipo em vez de virar entrada.
const ID_PATTERN = /^(?!__proto__$)[a-z0-9_:\-.]+$/;
const MAGIC = [0x50, 0x44, 0x58]; // "PDX"

// ---------------------------------------------------------------------------
// base64url (sem padding)
// ---------------------------------------------------------------------------

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const B64_LOOKUP = new Int16Array(128).fill(-1);
for (let i = 0; i < B64.length; i++) B64_LOOKUP[B64.charCodeAt(i)] = i;

export function base64urlEncode(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += B64[a >> 2];
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)];
    if (b !== undefined) out += B64[((b & 15) << 2) | ((c ?? 0) >> 6)];
    if (c !== undefined) out += B64[c & 63];
  }
  return out;
}

/** null se houver caractere invalido ou comprimento impossivel. */
export function base64urlDecode(text: string): Uint8Array | null {
  if (text.length % 4 === 1) return null;
  const out = new Uint8Array(Math.floor((text.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < text.length; i += 4) {
    const v: number[] = [];
    for (let j = i; j < Math.min(i + 4, text.length); j++) {
      const code = text.charCodeAt(j);
      const n = code < 128 ? B64_LOOKUP[code]! : -1;
      if (n < 0) return null;
      v.push(n);
    }
    out[o++] = (v[0]! << 2) | (v[1]! >> 4);
    if (v.length > 2) out[o++] = ((v[1]! & 15) << 4) | (v[2]! >> 2);
    if (v.length > 3) out[o++] = ((v[2]! & 3) << 6) | v[3]!;
  }
  return out.subarray(0, o);
}

// ---------------------------------------------------------------------------
// Escrita/leitura binaria com bounds check
// ---------------------------------------------------------------------------

class Writer {
  private buf = new Uint8Array(1024);
  private view = new DataView(this.buf.buffer);
  length = 0;

  private ensure(n: number): void {
    if (this.length + n <= this.buf.length) return;
    const next = new Uint8Array(Math.max(this.buf.length * 2, this.length + n));
    next.set(this.buf);
    this.buf = next;
    this.view = new DataView(next.buffer);
  }
  u8(v: number): void {
    if (!Number.isInteger(v) || v < 0 || v > 0xff) throw new RangeError(`u8 out of range: ${v}`);
    this.ensure(1);
    this.view.setUint8(this.length, v);
    this.length += 1;
  }
  u16(v: number): void {
    if (!Number.isInteger(v) || v < 0 || v > 0xffff) throw new RangeError(`u16 out of range: ${v}`);
    this.ensure(2);
    this.view.setUint16(this.length, v, true);
    this.length += 2;
  }
  u32(v: number): void {
    if (!Number.isInteger(v) || v < 0 || v > 0xffffffff) throw new RangeError(`u32 out of range: ${v}`);
    this.ensure(4);
    this.view.setUint32(this.length, v, true);
    this.length += 4;
  }
  bytes(b: Uint8Array): void {
    this.ensure(b.length);
    this.buf.set(b, this.length);
    this.length += b.length;
  }
  ascii(s: string): void {
    if (s.length > 0 && !ID_PATTERN.test(s)) throw new RangeError(`invalid id: ${JSON.stringify(s)}`);
    this.u8(s.length);
    for (let i = 0; i < s.length; i++) this.u8(s.charCodeAt(i));
  }
  seconds(ms: number): void {
    this.u32(Math.floor(ms / 1000));
  }
  result(): Uint8Array {
    return this.buf.slice(0, this.length);
  }
}

class Reader {
  private pos = 0;
  private readonly view: DataView;
  constructor(private readonly buf: Uint8Array) {
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  private need(n: number): void {
    if (this.pos + n > this.buf.length) throw new SyncError("corrupted", "truncated payload");
  }
  u8(): number {
    this.need(1);
    return this.view.getUint8(this.pos++);
  }
  u16(): number {
    this.need(2);
    const v = this.view.getUint16(this.pos, true);
    this.pos += 2;
    return v;
  }
  u32(): number {
    this.need(4);
    const v = this.view.getUint32(this.pos, true);
    this.pos += 4;
    return v;
  }
  bytes(n: number): Uint8Array {
    this.need(n);
    const b = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return b;
  }
  ascii(): string {
    const len = this.u8();
    const b = this.bytes(len);
    const s = String.fromCharCode(...b);
    if (len > 0 && !ID_PATTERN.test(s)) throw new SyncError("corrupted", "invalid id");
    return s;
  }
  ms(): number {
    return this.u32() * 1000;
  }
  get remaining(): number {
    return this.buf.length - this.pos;
  }
}

// ---------------------------------------------------------------------------
// Payload
// ---------------------------------------------------------------------------

function fullDocs(docs: Partial<DocMap>): UserDocs {
  return {
    captured: docs.captured ?? structuredClone(DOC_DEFAULTS.captured),
    team: docs.team ?? structuredClone(DOC_DEFAULTS.team),
    history: docs.history ?? structuredClone(DOC_DEFAULTS.history),
    trainerProgress: docs.trainerProgress ?? structuredClone(DOC_DEFAULTS.trainerProgress),
    preferences: docs.preferences ?? structuredClone(DOC_DEFAULTS.preferences),
  };
}

const LANGS = ["pt", "en"] as const;

export function encodePayload(docs: Partial<DocMap>, exportedAtMs: number): Uint8Array {
  const d = fullDocs(docs);
  const w = new Writer();
  for (const b of MAGIC) w.u8(b);
  w.u8(SUPPORTED_SYNC_VERSION);
  w.u8(docs.meta?.schemaVersion ?? CURRENT_SCHEMA_VERSION);
  w.seconds(exportedAtMs);

  const captured = Object.entries(d.captured.entries)
    .map(([k, v]) => ({ dex: Number(k), at: v.capturedAt }))
    .sort((a, b) => a.dex - b.dex);
  for (const c of captured) {
    if (!Number.isInteger(c.dex) || c.dex <= 0 || c.dex > 0xffff) throw new RangeError(`dex out of range: ${c.dex}`);
  }
  const maxDex = Math.max(DEFAULT_MAX_DEX, ...captured.filter((c) => c.dex < CUSTOM_DEX_START).map((c) => c.dex));
  const bitmap = new Uint8Array(Math.ceil((maxDex + 1) / 8));
  const custom: number[] = [];
  for (const c of captured) {
    if (c.dex <= maxDex) bitmap[c.dex >> 3]! |= 1 << (c.dex & 7);
    else custom.push(c.dex);
  }
  w.u16(maxDex);
  w.bytes(bitmap);
  w.u8(custom.length);
  for (const dex of custom) w.u16(dex);
  // capturedAtMode 1: (dex, at) para todos os capturados, em ordem crescente de dex
  w.u8(1);
  for (const c of captured) {
    w.u16(c.dex);
    w.seconds(c.at);
  }

  const slots = normalizeTeam(d.team.slots);
  for (const s of slots) w.u16(s ?? 0);

  const history = d.history.entries.slice(0, HISTORY_LIMIT);
  w.u8(history.length);
  for (const h of history) {
    w.u16(h.dex);
    w.seconds(h.viewedAt);
  }

  const tp = d.trainerProgress;
  w.ascii(tp.activeSeriesId ?? "");
  w.u8(tp.freeroam.active ? 1 : 0);
  w.ascii(tp.freeroam.pausedSeriesId ?? "");
  const series = Object.entries(tp.series);
  w.u8(series.length);
  for (const [sid, s] of series) {
    w.ascii(sid);
    const defeated = Object.entries(s.defeated);
    w.u16(defeated.length);
    for (const [tid, v] of defeated) {
      w.ascii(tid);
      w.seconds(v.at);
    }
  }

  const p = d.preferences;
  const themeIndex = THEME_IDS.indexOf(p.theme);
  if (themeIndex < 0) throw new RangeError(`unknown theme: ${p.theme}`);
  w.u8(themeIndex);
  w.u8(LANGS.indexOf(p.uiLanguage));
  w.u8(LANGS.indexOf(p.termsLanguage));
  w.u8(p.soundEnabled ? 1 : 0);
  w.u8(p.reduceMotion === null ? 2 : p.reduceMotion ? 1 : 0);
  const overrides = Object.entries(p.termsOverrides);
  w.u8(overrides.length);
  for (const [card, lang] of overrides) {
    w.ascii(card);
    w.u8(LANGS.indexOf(lang));
  }
  return w.result();
}

function lang(v: number): "pt" | "en" {
  const l = LANGS[v];
  if (!l) throw new SyncError("corrupted", "invalid language");
  return l;
}

function bool(v: number): boolean {
  if (v > 1) throw new SyncError("corrupted", "invalid boolean");
  return v === 1;
}

/** Passo 9: leitura campo a campo (o cabecalho ja foi validado). */
function decodeBody(r: Reader, now: number): UserDocs {
  const maxDex = r.u16();
  const bitmap = r.bytes(Math.ceil((maxDex + 1) / 8));
  const dexes: number[] = [];
  for (let dex = 1; dex <= maxDex; dex++) if (bitmap[dex >> 3]! & (1 << (dex & 7))) dexes.push(dex);
  if (bitmap[0]! & 1) throw new SyncError("corrupted", "bit 0 set");
  const customCount = r.u8();
  for (let i = 0; i < customCount; i++) {
    const dex = r.u16();
    if (dex <= maxDex || dexes.includes(dex)) throw new SyncError("corrupted", "invalid custom dex");
    dexes.push(dex);
  }
  dexes.sort((a, b) => a - b);
  const entries: Record<string, { capturedAt: number }> = {};
  const mode = r.u8();
  if (mode === 0) {
    for (const dex of dexes) entries[String(dex)] = { capturedAt: now };
  } else if (mode === 1) {
    for (const dex of dexes) {
      if (r.u16() !== dex) throw new SyncError("corrupted", "capturedAt list out of order");
      entries[String(dex)] = { capturedAt: r.ms() };
    }
  } else {
    throw new SyncError("corrupted", "invalid capturedAtMode");
  }

  const slots: (number | null)[] = [];
  for (let i = 0; i < TEAM_SIZE; i++) {
    const v = r.u16();
    slots.push(v === 0 ? null : v);
  }

  const historyCount = r.u8();
  if (historyCount > HISTORY_LIMIT) throw new SyncError("corrupted", "history too long");
  const history: { dex: number; viewedAt: number }[] = [];
  for (let i = 0; i < historyCount; i++) {
    const dex = r.u16();
    if (dex === 0) throw new SyncError("corrupted", "invalid history dex");
    history.push({ dex, viewedAt: r.ms() });
  }

  const active = r.ascii();
  const freeroamActive = bool(r.u8());
  const paused = r.ascii();
  const seriesCount = r.u8();
  const series: Record<string, { defeated: Record<string, { at: number }> }> = {};
  for (let i = 0; i < seriesCount; i++) {
    const sid = r.ascii();
    if (!sid || Object.hasOwn(series, sid)) throw new SyncError("corrupted", "invalid series id");
    const n = r.u16();
    const defeated: Record<string, { at: number }> = {};
    for (let j = 0; j < n; j++) {
      const tid = r.ascii();
      if (!tid || Object.hasOwn(defeated, tid)) throw new SyncError("corrupted", "invalid trainer id");
      defeated[tid] = { at: r.ms() };
    }
    series[sid] = { defeated };
  }

  const theme = THEME_IDS[r.u8()];
  if (!theme) throw new SyncError("corrupted", "invalid theme");
  const uiLanguage = lang(r.u8());
  const termsLanguage = lang(r.u8());
  const soundEnabled = bool(r.u8());
  const rm = r.u8();
  if (rm > 2) throw new SyncError("corrupted", "invalid reduceMotion");
  const overrideCount = r.u8();
  const termsOverrides: Record<string, "pt" | "en"> = {};
  for (let i = 0; i < overrideCount; i++) {
    const card = r.ascii();
    if (!card) throw new SyncError("corrupted", "invalid card key");
    termsOverrides[card] = lang(r.u8());
  }
  if (r.remaining !== 0) throw new SyncError("corrupted", "trailing bytes");

  return {
    captured: { schemaVersion: 1, entries },
    team: { schemaVersion: 1, slots },
    history: { schemaVersion: 1, entries: history },
    trainerProgress: {
      schemaVersion: 1,
      activeSeriesId: active || null,
      freeroam: { active: freeroamActive, pausedSeriesId: paused || null },
      series,
    },
    preferences: {
      schemaVersion: 1,
      theme,
      uiLanguage,
      termsLanguage,
      termsOverrides,
      soundEnabled,
      reduceMotion: rm === 2 ? null : rm === 1,
    },
  };
}

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

/** Envelope sobre um payload ja montado (exposto para testes de payload arbitrario). */
export function wrapPayload(payload: Uint8Array): string {
  const compressed = deflateSync(payload, { level: 9 });
  const out = new Uint8Array(compressed.length + 4);
  out.set(compressed);
  new DataView(out.buffer).setUint32(compressed.length, crc32(compressed), true);
  return SYNC_PREFIX + base64urlEncode(out);
}

export function encodeSyncCode(
  docs: Partial<DocMap>,
  opts: { now?: number; sessionId?: string; capacity?: number } = {},
): SyncEncoded {
  const now = opts.now ?? Date.now();
  const payload = encodePayload(docs, now);
  const text = wrapPayload(payload);
  const exportedAt = Math.floor(now / 1000) * 1000;
  return {
    text,
    frames: splitFrames(text, opts.capacity ?? FRAME_CAPACITY, opts.sessionId),
    bytes: payload.length,
    summary: summarize(fullDocs(docs), null, { exportedAt }),
  };
}

const OVERSIZED = Symbol("oversized");

function inflateLimited(compressed: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [];
  let total = 0;
  const inflater = new Inflate((chunk) => {
    total += chunk.length;
    if (total > MAX_INFLATED_BYTES) throw OVERSIZED;
    chunks.push(chunk);
  });
  const STEP = 1024;
  for (let i = 0; i < compressed.length; i += STEP) {
    const end = Math.min(i + STEP, compressed.length);
    inflater.push(compressed.subarray(i, end), end === compressed.length);
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

function fail(code: SyncError["code"], message?: string): Result<never, SyncError> {
  return { ok: false, error: new SyncError(code, message) };
}

export function decodeSyncCode(
  input: string,
  opts: { now?: number; migrations?: readonly Migration[] } = {},
): Result<SyncDecoded, SyncError> {
  // 1. normaliza (remove todo whitespace)
  const text = input.replace(/\s+/g, "");
  if (text.length === 0) return fail("empty");
  // 2. limite barato antes de decodificar
  if (text.length > MAX_TEXT_LENGTH) return fail("oversized", "text too long");
  // 3. prefixo
  if (text.startsWith(FRAME_PREFIX)) return fail("incomplete", "frame: feed it to FrameCollector");
  if (!text.startsWith(SYNC_PREFIX)) return fail("foreignApp");
  // 4. base64url
  const bytes = base64urlDecode(text.slice(SYNC_PREFIX.length));
  if (!bytes || bytes.length < 5) return fail("corrupted", "invalid base64url");
  // 5. tamanho comprimido
  const compressed = bytes.subarray(0, bytes.length - 4);
  if (compressed.length > MAX_COMPRESSED_BYTES) return fail("oversized", "compressed too large");
  // 6. crc
  const trailer = new DataView(bytes.buffer, bytes.byteOffset + compressed.length, 4).getUint32(0, true);
  if (crc32(compressed) !== trailer) return fail("corrupted", "crc mismatch");
  // 7. inflate com limite
  let payload: Uint8Array;
  try {
    payload = inflateLimited(compressed);
  } catch (e) {
    if (e === OVERSIZED) return fail("oversized", "inflated too large");
    return fail("corrupted", "deflate error");
  }
  // 8. cabecalho
  if (payload.length < 5 || payload[0] !== MAGIC[0] || payload[1] !== MAGIC[1] || payload[2] !== MAGIC[2]) {
    return fail("foreignApp", "bad magic");
  }
  const formatVersion = payload[3]!;
  const schemaVersion = payload[4]!;
  if (formatVersion > SUPPORTED_SYNC_VERSION || schemaVersion > CURRENT_SCHEMA_VERSION) return fail("unsupportedVersion");
  if (formatVersion < 1) return fail("corrupted", "invalid format version");
  // 9. campos
  try {
    const r = new Reader(payload.subarray(5));
    const exportedAt = r.ms();
    let docs = decodeBody(r, opts.now ?? Date.now());
    if (schemaVersion < CURRENT_SCHEMA_VERSION) {
      const migrations = opts.migrations ?? [createV1FromPrototypeMigration(null)];
      docs = fullDocs(applyMigrations(docs, schemaVersion, CURRENT_SCHEMA_VERSION, migrations).docs);
    }
    return { ok: true, value: { docs, schemaVersion, exportedAt, summary: summarize(docs, null, { exportedAt }) } };
  } catch (e) {
    if (e instanceof SyncError) return { ok: false, error: e };
    return fail("corrupted", e instanceof Error ? e.message : "corrupted");
  }
}

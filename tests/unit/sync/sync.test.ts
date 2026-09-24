// @vitest-environment node
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { defaultDocs, type DocMap } from "../../../src/storage";
import { THEME_IDS } from "../../../src/styles/themes";
import {
  FrameCollector,
  base64urlDecode,
  base64urlEncode,
  decodeSyncCode,
  encodePayload,
  encodeSyncCode,
  mergeDocuments,
  splitFrames,
  summarize,
  wrapPayload,
  type SyncErrorCode,
  type UserDocs,
} from "../../../src/sync";

const NOW = 1_790_000_000_123;

function userDocs(d: DocMap | UserDocs): UserDocs {
  const { captured, team, history, trainerProgress, preferences } = d;
  return { captured, team, history, trainerProgress, preferences };
}

/** Timestamps dos docs caem para o segundo (u32 segundos no codec). */
function truncateSeconds(d: UserDocs): UserDocs {
  const s = (ms: number) => Math.floor(ms / 1000) * 1000;
  const c = structuredClone(d);
  for (const v of Object.values(c.captured.entries)) v.capturedAt = s(v.capturedAt);
  for (const e of c.history.entries) e.viewedAt = s(e.viewedAt);
  for (const ser of Object.values(c.trainerProgress.series)) for (const v of Object.values(ser.defeated)) v.at = s(v.at);
  return c;
}

function decodeOk(text: string) {
  const r = decodeSyncCode(text, { now: NOW });
  if (!r.ok) throw new Error(`expected ok, got ${r.error.code}: ${r.error.message}`);
  return r.value;
}

function errorCode(text: string): SyncErrorCode | "ok" {
  const r = decodeSyncCode(text, { now: NOW });
  return r.ok ? "ok" : r.error.code;
}

function exampleA(): DocMap {
  const d = defaultDocs(0);
  for (let dex = 1; dex <= 10; dex++) d.captured.entries[String(dex)] = { capturedAt: 1_700_000_000_000 + dex * 1000 };
  d.trainerProgress = {
    schemaVersion: 1,
    activeSeriesId: "bdsp",
    freeroam: { active: false, pausedSeriesId: null },
    series: { bdsp: { defeated: { gym_leader_roark_0395: { at: 1_700_000_500_000 } } } },
  };
  d.team.slots = [6, 448, 94, 149, null, null];
  d.history.entries = [
    { dex: 6, viewedAt: 1_700_000_900_000 },
    { dex: 448, viewedAt: 1_700_000_800_000 },
    { dex: 25, viewedAt: 1_700_000_700_000 },
  ];
  return d;
}

const idArb = fc.stringMatching(/^[a-z0-9_:.-]{1,24}$/).filter((s) => s !== "__proto__"); // o codec recusa "__proto__"
const msArb = fc.integer({ min: 0, max: 0xffffffff }).map((s) => s * 1000 + 999);
const dexArb = fc.oneof(fc.integer({ min: 1, max: 1025 }), fc.constantFrom(9901, 9902));

const docsArb: fc.Arbitrary<UserDocs> = fc.record({
  captured: fc
    .dictionary(dexArb.map(String), fc.record({ capturedAt: msArb }), { maxKeys: 60 })
    .map((entries) => ({ schemaVersion: 1 as const, entries })),
  team: fc
    .array(fc.option(dexArb, { nil: null }), { minLength: 6, maxLength: 6 })
    .map((slots) => ({ schemaVersion: 1 as const, slots })),
  history: fc
    .uniqueArray(fc.record({ dex: dexArb, viewedAt: msArb }), { maxLength: 20, selector: (e) => e.dex })
    .map((entries) => ({ schemaVersion: 1 as const, entries })),
  trainerProgress: fc.record({
    schemaVersion: fc.constant(1 as const),
    activeSeriesId: fc.option(idArb, { nil: null }),
    freeroam: fc.record({ active: fc.boolean(), pausedSeriesId: fc.option(idArb, { nil: null }) }),
    series: fc.dictionary(idArb, fc.record({ defeated: fc.dictionary(idArb, fc.record({ at: msArb }), { maxKeys: 8 }) }), {
      maxKeys: 5,
    }),
  }),
  preferences: fc.record({
    schemaVersion: fc.constant(1 as const),
    theme: fc.constantFrom(...THEME_IDS),
    uiLanguage: fc.constantFrom("pt" as const, "en" as const),
    termsLanguage: fc.constantFrom("pt" as const, "en" as const),
    termsOverrides: fc.dictionary(idArb, fc.constantFrom("pt" as const, "en" as const), { maxKeys: 6 }),
    soundEnabled: fc.boolean(),
    reduceMotion: fc.constantFrom(true, false, null),
  }),
});

describe("sync codec round-trip", () => {
  it("decode(encode(x)) == x modulo second precision (property)", () => {
    fc.assert(
      fc.property(docsArb, (docs) => {
        const { text } = encodeSyncCode(docs, { now: NOW });
        const decoded = decodeOk(text);
        expect(decoded.docs).toEqual(truncateSeconds(docs));
        expect(decoded.exportedAt).toBe(Math.floor(NOW / 1000) * 1000);
      }),
      { numRuns: 150 },
    );
  });

  it("team with nulls in any position comes back identical", () => {
    const d = defaultDocs(0);
    d.team.slots = [6, null, 94, null, null, 149];
    expect(decodeOk(encodeSyncCode(d, { now: NOW }).text).docs.team.slots).toEqual([6, null, 94, null, null, 149]);
  });

  it("strips whitespace and line breaks (WhatsApp paste)", () => {
    const { text } = encodeSyncCode(exampleA(), { now: NOW });
    const messy = `  ${text.slice(0, 10)}\n${text.slice(10, 30)} \r\n\t${text.slice(30)}  `;
    expect(decodeOk(messy).docs).toEqual(truncateSeconds(userDocs(exampleA())));
  });

  it("encode rejects ids outside the ASCII pattern", () => {
    const d = defaultDocs(0);
    d.trainerProgress.series = { "Bad Id": { defeated: {} } };
    expect(() => encodeSyncCode(d)).toThrow(RangeError);
  });

  it("base64url helpers round-trip and reject invalid text", () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);
    expect(base64urlDecode(base64urlEncode(bytes))).toEqual(bytes);
    expect(base64urlDecode("ab+c")).toBeNull();
    expect(base64urlDecode("abcde")).toBeNull();
  });
});

describe("decode verification order (one error per step)", () => {
  const valid = () => encodeSyncCode(exampleA(), { now: NOW }).text;
  const payload = () => encodePayload(exampleA(), NOW);

  it("1. blank -> empty", () => {
    expect(errorCode("")).toBe("empty");
    expect(errorCode(" \n\t ")).toBe("empty");
  });

  it("2. more than 200000 chars -> oversized before decoding", () => {
    expect(errorCode("PDX1." + "A".repeat(199_996))).toBe("oversized"); // 200001
    expect(errorCode("garbage".repeat(40_000))).toBe("oversized"); // mesmo sem prefixo: passo 2 vem antes do 3
  });

  it("3. prefix: PDXF. goes to the collector, anything else -> foreignApp", () => {
    expect(errorCode("hello world")).toBe("foreignApp");
    expect(errorCode("PDX2.AAAA")).toBe("foreignApp");
    expect(errorCode("PDXF.1/2.abc123.AAAA")).toBe("incomplete");
  });

  it("4. invalid base64url or fewer than 5 bytes -> corrupted", () => {
    expect(errorCode("PDX1.@@@@")).toBe("corrupted");
    expect(errorCode("PDX1.AAAA")).toBe("corrupted"); // 3 bytes
  });

  it("5. compressed over 65536 bytes -> oversized (before inflating)", () => {
    const random = new Uint8Array(70_000);
    let x = 12345;
    for (let i = 0; i < random.length; i++) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      random[i] = x >>> 24;
    }
    const text = wrapPayload(random);
    expect(text.length).toBeLessThan(200_000);
    expect(errorCode(text)).toBe("oversized");
  });

  it("6. crc mismatch -> corrupted", () => {
    const bytes = base64urlDecode(valid().slice(5))!;
    bytes[bytes.length - 1]! ^= 0xff;
    expect(errorCode("PDX1." + base64urlEncode(bytes))).toBe("corrupted");
  });

  it("7. inflating past 512 KB -> oversized; deflate error -> corrupted", () => {
    expect(errorCode(wrapPayload(new Uint8Array(600_000)))).toBe("oversized");
    const bad = new Uint8Array([0xff, 0xff, 0xff, 0xff]); // BTYPE 11 = bloco deflate invalido
    const buf = new Uint8Array(8);
    buf.set(bad);
    new DataView(buf.buffer).setUint32(4, crcOf(bad), true);
    expect(errorCode("PDX1." + base64urlEncode(buf))).toBe("corrupted");
  });

  it("8. wrong magic -> foreignApp; formatVersion 9 or newer schema -> unsupportedVersion", () => {
    const p1 = payload();
    p1[0] = 0x58;
    expect(errorCode(wrapPayload(p1))).toBe("foreignApp");
    const p2 = payload();
    p2[3] = 9;
    expect(errorCode(wrapPayload(p2))).toBe("unsupportedVersion");
    const p3 = payload();
    p3[4] = 2;
    expect(errorCode(wrapPayload(p3))).toBe("unsupportedVersion");
  });

  it("9. truncated fields or trailing bytes -> corrupted", () => {
    const p = payload();
    expect(errorCode(wrapPayload(p.subarray(0, p.length - 1)))).toBe("corrupted");
    const longer = new Uint8Array(p.length + 1);
    longer.set(p);
    expect(errorCode(wrapPayload(longer))).toBe("corrupted");
    expect(errorCode(wrapPayload(p.subarray(0, 12)))).toBe("corrupted");
  });

  it("a valid code decodes and its summary counts entities", () => {
    const v = decodeOk(valid());
    expect(v.summary).toMatchObject({ captured: 10, team: 4, history: 3, trainersDefeated: { bdsp: 1 }, preferences: true });
  });
});

function crcOf(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

describe("multi-frame", () => {
  function maxCase(): DocMap {
    const d = defaultDocs(0);
    for (let dex = 1; dex <= 1025; dex++) d.captured.entries[String(dex)] = { capturedAt: 1_700_000_000_000 + dex * 7919000 };
    d.captured.entries["9901"] = { capturedAt: 1_700_000_000_000 };
    d.captured.entries["9902"] = { capturedAt: 1_700_000_001_000 };
    d.team.slots = [6, 448, 94, 149, 9901, 25];
    d.history.entries = Array.from({ length: 20 }, (_, i) => ({ dex: i + 100, viewedAt: 1_700_100_000_000 - i * 60_000 }));
    const series = ["bdsp", "radicalred", "unbound", "atm_team", "contentcreators"];
    for (let i = 0; i < 110; i++) {
      const sid = series[i % series.length]!;
      const s = (d.trainerProgress.series[sid] ??= { defeated: {} });
      s.defeated[`gym_leader_trainer_${i.toString(16).padStart(4, "0")}`] = { at: 1_700_200_000_000 + i * 3_600_000 };
    }
    d.trainerProgress.activeSeriesId = "bdsp";
    d.preferences.termsOverrides = { moves: "en", abilities: "pt" };
    return d;
  }

  it("the max case needs >= 2 frames and rebuilds identically in any order", () => {
    const docs = maxCase();
    const enc = encodeSyncCode(docs, { now: NOW, sessionId: "abc123" });
    expect(enc.frames.length).toBeGreaterThanOrEqual(2);
    for (const f of enc.frames) expect(f.length).toBeLessThanOrEqual(900);
    const collector = new FrameCollector();
    const order = [...enc.frames].reverse();
    let last = collector.add(order[0]!);
    expect(last).toMatchObject({ complete: false, received: 1, total: enc.frames.length, sessionId: "abc123" });
    expect(collector.add(order[0]!).received).toBe(1); // repetido ignorado
    for (const f of order.slice(1)) last = collector.add(f);
    expect(last.complete).toBe(true);
    const text = collector.assemble()!;
    expect(text).toBe(enc.text);
    expect(decodeOk(text).docs).toEqual(truncateSeconds(userDocs(docs)));
  });

  it("rejects a frame from another session and reports missing frames", () => {
    const text = encodeSyncCode(maxCase(), { now: NOW }).text;
    const a = splitFrames(text, 900, "aaaaaa");
    const b = splitFrames(text, 900, "bbbbbb");
    const collector = new FrameCollector();
    collector.add(a[0]!);
    expect(collector.add(b[1]!)).toMatchObject({ error: "otherSession", received: 1 });
    expect(collector.assemble()).toBeNull();
    expect(collector.add("PDXF.x/2.aaaaaa.AAA").error).toBe("invalidFrame");
  });

  it("a short code is a single QR and a non-frame text is taken as a whole code", () => {
    const enc = encodeSyncCode(exampleA(), { now: NOW });
    expect(enc.frames).toEqual([enc.text]);
    const collector = new FrameCollector();
    expect(collector.add(enc.text).complete).toBe(true);
    expect(collector.assemble()).toBe(enc.text);
  });
});

describe("mergeDocuments", () => {
  it("PRD example: B receives A in merge mode", () => {
    const a = exampleA();
    const b = defaultDocs(0);
    for (let dex = 11; dex <= 15; dex++) b.captured.entries[String(dex)] = { capturedAt: 1_750_000_000_000 };
    b.history.entries = [
      { dex: 150, viewedAt: 1_750_000_000_000 },
      { dex: 133, viewedAt: 1_600_000_000_000 },
    ];
    b.preferences.theme = "green";
    const incoming = decodeOk(encodeSyncCode(a, { now: NOW }).text).docs;
    const merged = mergeDocuments(b, incoming, "merge");
    expect(Object.keys(merged.captured.entries).map(Number).sort((x, y) => x - y)).toEqual(
      Array.from({ length: 15 }, (_, i) => i + 1),
    );
    expect(merged.trainerProgress.series.bdsp?.defeated).toEqual({ gym_leader_roark_0395: { at: 1_700_000_500_000 } });
    expect(merged.trainerProgress.activeSeriesId).toBe("bdsp");
    expect(merged.team.slots).toEqual([6, 448, 94, 149, null, null]);
    expect(merged.history.entries.map((e) => e.dex)).toEqual([150, 6, 448, 25, 133]);
    expect(merged.preferences.theme).toBe("green");
    expect(merged.meta).toEqual(b.meta);
  });

  it("merge keeps the earliest capturedAt / defeat time and the receiver's non-empty team and active series", () => {
    const local = defaultDocs(0);
    local.captured.entries["6"] = { capturedAt: 5000 };
    local.team.slots = [25, null, null, null, null, null];
    local.trainerProgress.activeSeriesId = "unbound";
    local.trainerProgress.series = { bdsp: { defeated: { x: { at: 9000 } } } };
    const incoming = defaultDocs(0);
    incoming.captured.entries["6"] = { capturedAt: 1000 };
    incoming.team.slots = [1, 2, 3, null, null, null];
    incoming.trainerProgress.activeSeriesId = "bdsp";
    incoming.trainerProgress.series = { bdsp: { defeated: { x: { at: 2000 }, y: { at: 3000 } } } };
    const m = mergeDocuments(local, incoming, "merge");
    expect(m.captured.entries["6"]).toEqual({ capturedAt: 1000 });
    expect(m.team.slots).toEqual([25, null, null, null, null, null]);
    expect(m.trainerProgress.activeSeriesId).toBe("unbound");
    expect(m.trainerProgress.series.bdsp?.defeated).toEqual({ x: { at: 2000 }, y: { at: 3000 } });
  });

  it("replace copies incoming docs, defaults for absent ones, and never touches meta", () => {
    const local = exampleA();
    local.meta.datasetVersionSeen = "v-local";
    const m = mergeDocuments(local, { team: { schemaVersion: 1, slots: [1, null, null, null, null, null] } }, "replace");
    expect(m.team.slots).toEqual([1, null, null, null, null, null]);
    expect(m.captured.entries).toEqual({});
    expect(m.meta.datasetVersionSeen).toBe("v-local");
  });

  it("summarize counts unknown dex and trainer ids as orphans", () => {
    const d = exampleA();
    d.captured.entries["9999"] = { capturedAt: 1 };
    const s = summarize(d, [{ dex: 1 }, { dex: 2 }, { dex: 3 }, { dex: 4 }, { dex: 5 }, { dex: 6 }, { dex: 7 }, { dex: 8 }, { dex: 9 }, { dex: 10 }, { dex: 25 }, { dex: 94 }, { dex: 149 }, { dex: 448 }], {
      knownTrainerIds: new Set(["other"]),
    });
    expect(s.unknownIds).toBe(2); // dex 9999 + gym_leader_roark_0395
  });
});

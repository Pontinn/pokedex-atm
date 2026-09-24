// @vitest-environment node
import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { IndexedDbAdapter, defaultDoc, type DocMap } from "../../../src/storage";
import { applyBackup, backupFileName, deleteData, exportBackup, parseBackup, serializeBackup } from "../../../src/storage/backup";
import { canonicalJson, crc32Hex } from "../../../src/storage/crc32";

let n = 0;
async function adapter() {
  const a = new IndexedDbAdapter({ dbName: `pontindex-backup-${++n}`, legacyStorage: null });
  await a.init();
  return a;
}

const docs: Omit<DocMap, "meta"> = {
  captured: { schemaVersion: 1, entries: { "6": { capturedAt: 1000 }, "99999": { capturedAt: 5 } } },
  team: { schemaVersion: 1, slots: [6, null, 94, null, null, 149] },
  history: { schemaVersion: 1, entries: [{ dex: 6, viewedAt: 5 }] },
  trainerProgress: {
    schemaVersion: 1,
    activeSeriesId: "bdsp",
    freeroam: { active: false, pausedSeriesId: null },
    series: { bdsp: { defeated: { gym_leader_roark_0395: { at: 77 } } } },
  },
  preferences: {
    schemaVersion: 1,
    theme: "blue",
    uiLanguage: "en",
    termsLanguage: "en",
    termsOverrides: { moves: "pt" },
    soundEnabled: false,
    reduceMotion: null,
  },
};

function withoutLastWrite(all: Partial<DocMap>) {
  const c = structuredClone(all);
  if (c.meta) c.meta.lastWriteAt = 0;
  return c;
}

describe("backup", () => {
  it("export -> deleteData(all) -> import gives identical docs (except meta.lastWriteAt)", async () => {
    const a = await adapter();
    await a.writeMany(docs);
    const before = await a.readAll();
    const file = await exportBackup(a);
    expect(file).toMatchObject({ app: "pontindex", format: 1, schemaVersion: 1 });
    expect(file.crc32).toBe(crc32Hex(canonicalJson(file.documents)));
    const text = serializeBackup(file);

    await deleteData(a, "all");
    expect(await a.read("captured")).toEqual(defaultDoc("captured"));
    expect(await a.listSnapshots()).toEqual([]);

    const parsed = parseBackup(text);
    if (!parsed.ok) throw parsed.error;
    await applyBackup(a, parsed.value, "replace");
    expect(withoutLastWrite(await a.readAll())).toEqual(withoutLastWrite(before));
  });

  it("merge mode unions with local data and keeps the orphan dex", async () => {
    const a = await adapter();
    await a.writeMany(docs);
    const file = await exportBackup(a);
    const b = await adapter();
    await b.write("captured", { schemaVersion: 1, entries: { "25": { capturedAt: 9 } } });
    await applyBackup(b, file, "merge");
    expect(Object.keys((await b.read("captured"))!.entries).sort()).toEqual(["25", "6", "99999"]);
    expect((await b.read("preferences"))?.theme).toBe("classic");
  });

  it("accepts a BOM and rejects foreign, corrupted, oversized and newer files", async () => {
    const a = await adapter();
    await a.writeMany(docs);
    const text = serializeBackup(await exportBackup(a));
    expect(parseBackup("﻿" + text).ok).toBe(true);

    const code = (t: string) => {
      const r = parseBackup(t);
      return r.ok ? "ok" : r.error.code;
    };
    expect(code("")).toBe("empty");
    expect(code("{not json")).toBe("corrupted");
    expect(code(JSON.stringify({ app: "other" }))).toBe("foreignApp");
    const obj = JSON.parse(text);
    expect(code(JSON.stringify({ ...obj, crc32: "00000000" }))).toBe("corrupted");
    expect(code(JSON.stringify({ ...obj, format: 2 }))).toBe("corrupted");
    expect(code(JSON.stringify({ ...obj, schemaVersion: 5 }))).toBe("unsupportedVersion");
    const tampered = structuredClone(obj);
    tampered.documents.team.slots = [1, 2, 3, 4, 5, 6];
    expect(code(JSON.stringify(tampered))).toBe("corrupted");
    expect(code(" ".repeat(5 * 1024 * 1024 + 1) + "{}")).toBe("oversized");
  });

  it("deleteData with keys resets only those docs", async () => {
    const a = await adapter();
    await a.writeMany(docs);
    await deleteData(a, ["team", "meta"]);
    expect(await a.read("team")).toEqual(defaultDoc("team"));
    expect(await a.read("captured")).toEqual(docs.captured);
    expect(backupFileName(new Date(2026, 8, 4))).toBe("pontindex-backup-2026-09-04.json");
  });
});

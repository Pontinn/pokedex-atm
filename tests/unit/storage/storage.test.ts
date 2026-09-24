// @vitest-environment node
import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  IndexedDbAdapter,
  MemoryAdapter,
  createCapturedRepository,
  createHistoryRepository,
  createPreferencesRepository,
  createTeamRepository,
  createTrainerProgressRepository,
  defaultDoc,
  filterKnown,
  type DocMap,
} from "../../../src/storage";
import { LEGACY_SOUND_KEY, LEGACY_TERMS_KEY } from "../../../src/storage/migrations/v1-from-prototype-localstorage";

let dbCounter = 0;
const opened: IndexedDbAdapter[] = [];

function fakeLocalStorage(init: Record<string, string> = {}) {
  const data = new Map(Object.entries(init));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    removeItem: (k: string) => void data.delete(k),
    setItem: (k: string, v: string) => void data.set(k, v),
    data,
  };
}

async function makeAdapter(opts: ConstructorParameters<typeof IndexedDbAdapter>[0] = {}, dbName?: string) {
  const name = dbName ?? `pontindex-test-${++dbCounter}`;
  const adapter = new IndexedDbAdapter({ legacyStorage: null, ...opts, dbName: name });
  opened.push(adapter);
  await adapter.init();
  return { adapter, name };
}

afterEach(() => {
  for (const a of opened.splice(0)) a.close();
  vi.restoreAllMocks();
});

const sample: Omit<DocMap, "meta"> = {
  captured: { schemaVersion: 1, entries: { "6": { capturedAt: 1000 }, "9902": { capturedAt: 2000 } } },
  team: { schemaVersion: 1, slots: [6, null, 94, null, null, 149] },
  history: { schemaVersion: 1, entries: [{ dex: 6, viewedAt: 5 }, { dex: 25, viewedAt: 4 }] },
  trainerProgress: {
    schemaVersion: 1,
    activeSeriesId: "bdsp",
    freeroam: { active: false, pausedSeriesId: null },
    series: { bdsp: { defeated: { gym_leader_roark_0395: { at: 77 } } } },
  },
  preferences: {
    schemaVersion: 1,
    theme: "purple",
    uiLanguage: "en",
    termsLanguage: "pt",
    termsOverrides: { moves: "en" },
    soundEnabled: false,
    reduceMotion: true,
  },
};

describe("IndexedDbAdapter", () => {
  it("fresh install creates meta at the current schema version", async () => {
    const { adapter } = await makeAdapter({ now: () => 111 });
    expect(adapter.migration?.status).toBe("fresh");
    const meta = await adapter.read("meta");
    expect(meta?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(meta?.createdAt).toBe(111);
    expect(await adapter.read("captured")).toBeNull();
  });

  it("round-trips all 6 docs and survives reopening", async () => {
    let t = 1;
    const { adapter, name } = await makeAdapter({ now: () => ++t });
    await adapter.writeMany(sample);
    await adapter.write("meta", { ...(await adapter.read("meta"))!, datasetVersionSeen: "atm1.3.0-x" });
    adapter.close();
    const { adapter: again } = await makeAdapter({ now: () => ++t }, name);
    const all = await again.readAll();
    const { meta, ...docs } = all;
    expect(docs).toEqual(sample);
    expect(meta?.datasetVersionSeen).toBe("atm1.3.0-x");
    expect(meta?.lastWriteAt).toBeGreaterThan(meta!.createdAt);
  });

  it("write updates meta.lastWriteAt in the same transaction and re-saving is idempotent", async () => {
    let t = 10;
    const { adapter } = await makeAdapter({ now: () => ++t });
    await adapter.write("team", sample.team);
    const first = (await adapter.read("meta"))!.lastWriteAt;
    await adapter.write("team", sample.team);
    expect(await adapter.read("team")).toEqual(sample.team);
    expect((await adapter.read("meta"))!.lastWriteAt).toBeGreaterThan(first);
  });

  it("a QuotaExceededError mid-transaction leaves the previous doc intact", async () => {
    const { adapter } = await makeAdapter();
    await adapter.write("team", sample.team);
    const proto = IDBObjectStore.prototype;
    const original = proto.put;
    let calls = 0;
    vi.spyOn(proto, "put").mockImplementation(function (this: IDBObjectStore, ...args: Parameters<IDBObjectStore["put"]>) {
      calls++;
      // 1o put (o doc) entra na transacao; o 2o (meta) falha por quota -> a transacao inteira aborta
      if (calls === 2) throw new DOMException("quota", "QuotaExceededError");
      return original.apply(this, args);
    });
    await expect(adapter.write("team", { schemaVersion: 1, slots: [1, 2, 3, 4, 5, 6] })).rejects.toMatchObject({
      code: "QUOTA_EXCEEDED",
    });
    vi.restoreAllMocks();
    expect(await adapter.read("team")).toEqual(sample.team);
  });

  it("delete resets docs to defaults and keeps meta", async () => {
    const { adapter } = await makeAdapter();
    await adapter.writeMany(sample);
    await adapter.delete(["team", "history", "meta"]);
    expect(await adapter.read("team")).toEqual(defaultDoc("team"));
    expect(await adapter.read("history")).toEqual(defaultDoc("history"));
    expect(await adapter.read("captured")).toEqual(sample.captured);
    expect((await adapter.read("meta"))?.schemaVersion).toBe(1);
  });

  it("repairs a team with 5 slots and truncates history over 20", async () => {
    const { adapter } = await makeAdapter();
    await adapter.writeMany({ captured: sample.captured });
    // grava cru, por fora da validacao
    const backend = (adapter as unknown as { backend: { putDocs: (r: unknown[], t: null) => Promise<void> } }).backend;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await backend.putDocs(
      [
        { key: "team", doc: { schemaVersion: 1, slots: [6, 7, 8, 9, 10] } },
        {
          key: "history",
          doc: {
            schemaVersion: 1,
            entries: [...Array.from({ length: 25 }, (_, i) => ({ dex: i + 1, viewedAt: 100 - i })), { dex: "x", viewedAt: 1 }],
          },
        },
      ],
      null,
    );
    expect(await adapter.read("team")).toEqual({ schemaVersion: 1, slots: [6, 7, 8, 9, 10, null] });
    const h = await adapter.read("history");
    expect(h?.entries).toHaveLength(20);
    expect(warn).toHaveBeenCalled();
  });

  it("isolates an irreparable doc (team as a string) into backups and falls back to the default", async () => {
    const { adapter } = await makeAdapter({ now: () => 4242 });
    const backend = (adapter as unknown as { backend: { putDocs: (r: unknown[], t: null) => Promise<void> } }).backend;
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await backend.putDocs([{ key: "team", doc: "garbage" }], null);
    expect(await adapter.read("team")).toEqual(defaultDoc("team"));
    const snaps = await adapter.listSnapshots();
    expect(snaps.map((s) => s.id)).toContain("corrupt-team-4242");
    expect(snaps.find((s) => s.id === "corrupt-team-4242")?.docs).toEqual({ team: "garbage" });
    expect(adapter.notices).toContainEqual({ kind: "corrupt", key: "team", snapshotId: "corrupt-team-4242" });
    // o padrao foi regravado
    expect(await adapter.read("team")).toEqual(defaultDoc("team"));
  });

  it("ignores documents with unknown keys", async () => {
    const { adapter } = await makeAdapter();
    const backend = (adapter as unknown as { backend: { putDocs: (r: unknown[], t: null) => Promise<void> } }).backend;
    await backend.putDocs([{ key: "futureDoc", doc: { a: 1 } }], null);
    const all = await adapter.readAll();
    expect(Object.keys(all)).not.toContain("futureDoc");
    expect(Object.keys(all)).toContain("meta");
  });

  it("serializes concurrent repository writes (no lost update)", async () => {
    const { adapter } = await makeAdapter();
    const captured = createCapturedRepository(adapter, () => 5);
    const team = createTeamRepository(adapter);
    await Promise.all([captured.add(1), team.add(6), createHistoryRepository(adapter, () => 9).push(6)]);
    expect(await captured.has(1)).toBe(true);
    expect(await team.get()).toEqual([6, null, null, null, null, null]);
    expect((await adapter.read("history"))?.entries).toEqual([{ dex: 6, viewedAt: 9 }]);
  });
});

describe("migrations", () => {
  it("0 -> 1 imports prototype localStorage preferences and removes the keys", async () => {
    const ls = fakeLocalStorage({
      [LEGACY_TERMS_KEY]: JSON.stringify({ d: "en", o: { moves: "pt" } }),
      [LEGACY_SOUND_KEY]: "0",
    });
    const { adapter } = await makeAdapter({ legacyStorage: ls });
    expect(adapter.migration?.status).toBe("fresh");
    const prefs = await adapter.read("preferences");
    expect(prefs).toMatchObject({ termsLanguage: "en", termsOverrides: { moves: "pt" }, soundEnabled: false, theme: "classic" });
    expect(ls.data.has(LEGACY_TERMS_KEY)).toBe(false);
    expect(ls.data.has(LEGACY_SOUND_KEY)).toBe(false);
  });

  it("an old meta creates a pre-migration snapshot and restorePreMigrationSnapshot reverts", async () => {
    const { adapter, name } = await makeAdapter();
    const oldPrefs = { ...sample.preferences, termsLanguage: "pt" as const, soundEnabled: true };
    await adapter.writeMany({ preferences: oldPrefs, captured: sample.captured });
    await adapter.write("meta", { ...(await adapter.read("meta"))!, schemaVersion: 0 });
    adapter.close();

    const ls = fakeLocalStorage({ [LEGACY_TERMS_KEY]: JSON.stringify({ d: "en", o: {} }) });
    const { adapter: migrated } = await makeAdapter({ legacyStorage: ls, now: () => 999 }, name);
    expect(migrated.migration).toEqual({ status: "migrated", from: 0, to: 1, snapshotId: "pre-migration-v0-999" });
    expect((await migrated.read("preferences"))?.termsLanguage).toBe("en");
    expect((await migrated.read("meta"))?.schemaVersion).toBe(1);
    const snap = (await migrated.listSnapshots()).find((s) => s.id === "pre-migration-v0-999");
    expect(snap?.version).toBe(0);
    expect(snap?.docs.preferences).toEqual(oldPrefs);

    await migrated.restorePreMigrationSnapshot("pre-migration-v0-999");
    expect((await migrated.read("preferences"))?.termsLanguage).toBe("pt");
    expect((await migrated.read("meta"))?.schemaVersion).toBe(0);
    expect(await migrated.read("captured")).toEqual(sample.captured);
    await expect(migrated.restorePreMigrationSnapshot("nope")).rejects.toMatchObject({ code: "UNKNOWN" });
  });

  it("a newer schema version turns the adapter read-only (no writes)", async () => {
    const { adapter, name } = await makeAdapter();
    await adapter.write("meta", { ...(await adapter.read("meta"))!, schemaVersion: 7 });
    await adapter.write("team", sample.team);
    adapter.close();
    const { adapter: old } = await makeAdapter({}, name);
    expect(old.readOnly).toBe(true);
    expect(old.notices).toContainEqual({ kind: "readOnly", storedVersion: 7 });
    await expect(old.write("team", defaultDoc("team"))).rejects.toMatchObject({ code: "UNAVAILABLE" });
    expect(await old.read("team")).toEqual(sample.team);
  });
});

describe("repositories and filterKnown", () => {
  it("filterKnown hides dex 99999 without deleting it", async () => {
    const adapter = new MemoryAdapter({ legacyStorage: null });
    await adapter.init();
    const repo = createCapturedRepository(adapter, () => 1);
    await repo.add(6);
    await repo.add(99999);
    const index = [{ dex: 6 }, { dex: 25 }];
    expect((await repo.listKnown(index)).map((e) => e.dex)).toEqual([6]);
    expect(filterKnown([{ dex: 99999 }], new Set([1]))).toEqual([]);
    expect(await repo.has(99999)).toBe(true);
    expect(Object.keys((await adapter.read("captured"))!.entries).sort()).toEqual(["6", "99999"]);
  });

  it("captured add keeps the original date; remove deletes", async () => {
    const adapter = new MemoryAdapter({ legacyStorage: null });
    await adapter.init();
    const repo = createCapturedRepository(adapter);
    await repo.add(6, 100);
    await repo.add(6, 200);
    expect(await repo.getAll()).toEqual([{ dex: 6, capturedAt: 100 }]);
    await repo.remove(6);
    expect(await repo.getAll()).toEqual([]);
  });

  it("team repository reports full on the 7th", async () => {
    const adapter = new MemoryAdapter({ legacyStorage: null });
    await adapter.init();
    const team = createTeamRepository(adapter);
    for (const d of [1, 2, 3, 4, 5, 6]) expect((await team.add(d)).ok).toBe(true);
    expect(await team.add(7)).toMatchObject({ ok: false, reason: "full" });
    expect(await team.remove(3)).toEqual([1, 2, null, 4, 5, 6]);
  });

  it("trainer progress: mark/unmark, active series and freeroam pause/resume", async () => {
    const adapter = new MemoryAdapter({ legacyStorage: null });
    await adapter.init();
    const tp = createTrainerProgressRepository(adapter, () => 50);
    await tp.setActiveSeries("bdsp");
    await tp.markDefeated("bdsp", "gym_leader_roark_0395");
    await tp.markDefeated("bdsp", "gym_leader_roark_0395", 99);
    expect((await tp.get()).series.bdsp?.defeated).toEqual({ gym_leader_roark_0395: { at: 50 } });
    await tp.enterFreeroam();
    expect((await tp.get()).freeroam).toEqual({ active: true, pausedSeriesId: "bdsp" });
    await tp.leaveFreeroam();
    expect((await tp.get()).activeSeriesId).toBe("bdsp");
    expect((await tp.get()).freeroam.active).toBe(false);
    await tp.unmarkDefeated("bdsp", "gym_leader_roark_0395");
    expect((await tp.get()).series.bdsp?.defeated).toEqual({});
  });

  it("preferences patch and invalid writes are refused", async () => {
    const adapter = new MemoryAdapter({ legacyStorage: null });
    await adapter.init();
    const prefs = createPreferencesRepository(adapter);
    expect((await prefs.set({ theme: "orange" })).theme).toBe("orange");
    await expect(
      adapter.write("preferences", { ...(await prefs.get()), theme: "neon" as "classic" }),
    ).rejects.toMatchObject({ code: "UNKNOWN" });
    expect((await prefs.get()).theme).toBe("orange");
  });
});

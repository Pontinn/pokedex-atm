// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { StorageFailure, createStorageAdapter, defaultDoc, isStorageError, toStorageError, validateDoc } from "../../../src/storage";
import { getPersistenceResult, requestPersistence } from "../../../src/storage/persistence";
import { createHistoryRepository } from "../../../src/storage/repositories/history";

afterEach(() => vi.unstubAllGlobals());

describe("validateDoc repairs field by field", () => {
  it("captured drops invalid entries", () => {
    const r = validateDoc("captured", { schemaVersion: 1, entries: { "6": { capturedAt: 1 }, abc: { capturedAt: 2 }, "7": {} } });
    expect(r).toEqual({ ok: true, repaired: true, doc: { schemaVersion: 1, entries: { "6": { capturedAt: 1 } } } });
    expect(validateDoc("captured", { schemaVersion: 1 }).ok).toBe(false);
  });

  it("trainerProgress repairs freeroam, activeSeriesId and bad defeats", () => {
    const r = validateDoc("trainerProgress", {
      activeSeriesId: 3,
      freeroam: "x",
      series: { bdsp: { defeated: { a: { at: 1 }, b: { at: "no" } } }, bad: 4, bad2: { defeated: 1 } },
    });
    expect(r.ok && r.doc).toEqual({
      schemaVersion: 1,
      activeSeriesId: null,
      freeroam: { active: false, pausedSeriesId: null },
      series: { bdsp: { defeated: { a: { at: 1 } } } },
    });
    expect(validateDoc("trainerProgress", { series: [] }).ok).toBe(false);
  });

  it("preferences falls back per field to defaults", () => {
    const r = validateDoc("preferences", { theme: "neon", uiLanguage: "en", termsOverrides: { a: "pt", b: "xx" }, reduceMotion: "?" });
    expect(r.ok && r.doc).toEqual({ ...defaultDoc("preferences"), uiLanguage: "en", termsOverrides: { a: "pt" } });
  });

  it("meta needs a schemaVersion; the rest is repaired", () => {
    expect(validateDoc("meta", { createdAt: 1 }).ok).toBe(false);
    const r = validateDoc("meta", { schemaVersion: 1, createdAt: "x", datasetVersionSeen: 5 });
    expect(r.ok && r.doc.schemaVersion).toBe(1);
    expect(r.ok && r.doc.datasetVersionSeen).toBeNull();
    expect(validateDoc("history", "str").ok).toBe(false);
    expect(validateDoc("history", { entries: 3 }).ok).toBe(false);
  });
});

describe("errors, persistence and fallback", () => {
  it("maps DOM errors to StorageError codes", () => {
    expect(toStorageError(new DOMException("q", "QuotaExceededError")).code).toBe("QUOTA_EXCEEDED");
    expect(toStorageError(new DOMException("s", "InvalidStateError")).code).toBe("UNAVAILABLE");
    expect(toStorageError({ name: "blocked" }).code).toBe("BLOCKED");
    expect(toStorageError("weird").code).toBe("UNKNOWN");
    const f = new StorageFailure("BLOCKED", "b");
    expect(toStorageError(f)).toBe(f);
    expect(isStorageError(f)).toBe(true);
    expect(isStorageError(new Error("x"))).toBe(false);
  });

  it("requestPersistence stores the result, false when unsupported or throwing", async () => {
    expect(getPersistenceResult()).toBeNull();
    vi.stubGlobal("navigator", { storage: { persist: async () => true } });
    expect(await requestPersistence()).toBe(true);
    expect(getPersistenceResult()).toBe(true);
    vi.stubGlobal("navigator", { storage: { persist: async () => Promise.reject(new Error("no")) } });
    expect(await requestPersistence()).toBe(false);
    vi.stubGlobal("navigator", {});
    expect(await requestPersistence()).toBe(false);
  });

  it("without IndexedDB the factory returns a memory adapter with a persistent notice", async () => {
    vi.stubGlobal("indexedDB", undefined);
    const onNotice = vi.fn();
    const adapter = createStorageAdapter({ legacyStorage: null, onNotice });
    await adapter.init();
    expect(adapter.notices).toContainEqual({ kind: "memoryFallback" });
    await createHistoryRepository(adapter, () => 3).push(25);
    expect(await createHistoryRepository(adapter).get()).toEqual([{ dex: 25, viewedAt: 3 }]);
    expect(onNotice).toHaveBeenCalledWith({ kind: "memoryFallback" });
  });
});

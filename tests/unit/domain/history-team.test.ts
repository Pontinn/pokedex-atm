// @vitest-environment node
import { describe, expect, it } from "vitest";
import { HISTORY_LIMIT, mergeHistory, pushHistory } from "../../../src/domain/history";
import { TEAM_SIZE, addToTeam, isTeamEmpty, normalizeTeam, removeFromTeam } from "../../../src/domain/team";

describe("history", () => {
  it("keeps at most 20 entries and drops the oldest on the 21st", () => {
    let h = [] as ReturnType<typeof pushHistory>;
    for (let dex = 1; dex <= 21; dex++) h = pushHistory(h, dex, dex * 1000);
    expect(HISTORY_LIMIT).toBe(20);
    expect(h).toHaveLength(20);
    expect(h[0]).toEqual({ dex: 21, viewedAt: 21000 });
    expect(h.some((e) => e.dex === 1)).toBe(false);
    expect(h[19]!.dex).toBe(2);
  });

  it("moves a duplicate to the top instead of duplicating", () => {
    let h = pushHistory([], 6, 1);
    h = pushHistory(h, 448, 2);
    h = pushHistory(h, 25, 3);
    h = pushHistory(h, 6, 4);
    expect(h).toEqual([
      { dex: 6, viewedAt: 4 },
      { dex: 25, viewedAt: 3 },
      { dex: 448, viewedAt: 2 },
    ]);
  });

  it("rejects invalid dex", () => {
    expect(() => pushHistory([], 0, 1)).toThrow(RangeError);
    expect(() => pushHistory([], -3, 1)).toThrow(RangeError);
  });

  it("mergeHistory dedups by dex keeping the latest viewedAt, sorts desc, cuts at 20", () => {
    const a = [
      { dex: 6, viewedAt: 50 },
      { dex: 25, viewedAt: 10 },
    ];
    const b = [
      { dex: 25, viewedAt: 40 },
      { dex: 150, viewedAt: 30 },
    ];
    expect(mergeHistory(a, b)).toEqual([
      { dex: 6, viewedAt: 50 },
      { dex: 25, viewedAt: 40 },
      { dex: 150, viewedAt: 30 },
    ]);
    const many = Array.from({ length: 30 }, (_, i) => ({ dex: i + 1, viewedAt: i }));
    const merged = mergeHistory(many, []);
    expect(merged).toHaveLength(20);
    expect(merged[0]).toEqual({ dex: 30, viewedAt: 29 });
  });
});

describe("team", () => {
  it("fills the first empty slot and rejects the 7th", () => {
    let slots = normalizeTeam([]);
    expect(slots).toEqual([null, null, null, null, null, null]);
    for (const dex of [6, 448, 94, 149, 25, 1]) {
      const r = addToTeam(slots, dex);
      expect(r.ok).toBe(true);
      slots = r.slots;
    }
    expect(TEAM_SIZE).toBe(6);
    const seventh = addToTeam(slots, 150);
    expect(seventh).toEqual({ ok: false, reason: "full", slots: [6, 448, 94, 149, 25, 1] });
  });

  it("adding a present dex is a no-op success", () => {
    const r = addToTeam([6, null, null, null, null, null], 6);
    expect(r).toEqual({ ok: true, slots: [6, null, null, null, null, null] });
  });

  it("removing keeps positions and refills the first hole", () => {
    const removed = removeFromTeam([6, 448, 94, 149, null, null], 448);
    expect(removed).toEqual([6, null, 94, 149, null, null]);
    expect(addToTeam(removed, 25).slots).toEqual([6, 25, 94, 149, null, null]);
  });

  it("normalizes wrong lengths to 6 and rejects invalid dex", () => {
    expect(normalizeTeam([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5, null]);
    expect(normalizeTeam([1, 2, 3, 4, 5, 6, 7])).toEqual([1, 2, 3, 4, 5, 6]);
    expect(() => addToTeam([], 0)).toThrow(RangeError);
    expect(isTeamEmpty([null, null])).toBe(true);
    expect(isTeamEmpty([null, 3])).toBe(false);
  });
});

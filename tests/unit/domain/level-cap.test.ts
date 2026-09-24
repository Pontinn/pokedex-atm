// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { LevelCapConfig, SeriesInfo, TrainerInfo } from "../../../src/data/types";
import {
  capModeFromProgress,
  computeSeriesCap,
  computeTrainerLevel,
  defeatedSet,
  isAvailable,
  isFreeroamUnlocked,
  isSeriesCompleted,
  isSeriesUnlocked,
  requiredDefeatsSatisfied,
} from "../../../src/domain/level-cap";

const fixture = JSON.parse(
  readFileSync(new URL("../../fixtures/rules-storage/bdsp-key-trainers.json", import.meta.url), "utf8"),
) as { levelCapConfig: LevelCapConfig; trainers: Pick<TrainerInfo, "id" | "name" | "maxTeamLevel" | "requiredDefeats">[] };

const trainers: TrainerInfo[] = fixture.trainers.map((t) => ({
  ...t,
  type: "leader",
  typeLabel: { pt: "", en: "" },
  optional: false,
  signatureItem: null,
  biomes: { whitelist: [], blacklist: [] },
  source: "rctmod",
  team: [],
  bag: [],
}));
const config = fixture.levelCapConfig;
const ROARK = "gym_leader_roark_0395";
const MARS = "commander_mars_03c2";
const JUPITER = "commander_jupiter_041d";
const GARDENIA = "gym_leader_gardenia_03d6";
const CEDRIC = "pokemon_trainer_cedric_0446";
const MAYLENE = "gym_leader_maylene_03d8";

const cap = (defeated: string[]) =>
  computeSeriesCap({ keyTrainers: trainers, defeated: new Set(defeated), config, mode: "series" });

describe("BDSP worked example (initialLevelCap 15, relativeLevelCap 0)", () => {
  it("reproduces 15/16/20/22/22/30/100", () => {
    expect(cap([]).cap).toBe(15);
    expect(cap([]).available.map((t) => t.id)).toEqual([ROARK]);
    expect(cap([]).x).toBe(14);
    expect(cap([ROARK]).cap).toBe(16);
    expect(cap([ROARK, MARS]).cap).toBe(20);
    expect(cap([ROARK, MARS, JUPITER]).cap).toBe(22);
    const cedrics = cap([ROARK, MARS, JUPITER, GARDENIA]);
    expect(cedrics.available).toHaveLength(3);
    expect(cedrics.cap).toBe(22);
    const afterOneCedric = cap([ROARK, MARS, JUPITER, GARDENIA, CEDRIC]);
    expect(afterOneCedric.available.map((t) => t.id)).toContain(MAYLENE);
    expect(afterOneCedric.cap).toBe(22); // os outros 2 Cedric seguem disponiveis (22) e o min vale
    const allDone = cap(trainers.map((t) => t.id));
    expect(allDone).toMatchObject({ cap: 100, reason: "completed" });
  });

  it("Maylene alone available -> 30 (OR inside the group satisfied by one Cedric)", () => {
    const withoutOtherCedrics = trainers.filter((t) => !["pokemon_trainer_cedric_0445", "pokemon_trainer_cedric_0447"].includes(t.id));
    const r = computeSeriesCap({
      keyTrainers: withoutOtherCedrics,
      defeated: new Set([ROARK, MARS, JUPITER, GARDENIA, CEDRIC]),
      config,
      mode: "series",
      allTrainers: trainers,
    });
    expect(r.available.map((t) => t.id)).toEqual([MAYLENE]);
    expect(r.cap).toBe(30);
  });

  it("each Cedric inherits Gardenia's trainer level 22; Maylene = max(30, 22)", () => {
    const byId = new Map(trainers.map((t) => [t.id, t]));
    expect(computeTrainerLevel(byId.get(CEDRIC)!, byId, 0)).toBe(22);
    expect(computeTrainerLevel(byId.get(MAYLENE)!, byId, 0)).toBe(30);
    expect(computeTrainerLevel(byId.get(ROARK)!, byId, 90)).toBe(100); // clamp antes de comparar
  });

  it("none -> max(15, 1) = 15; freeroam -> 100", () => {
    expect(computeSeriesCap({ keyTrainers: trainers, defeated: new Set(), config, mode: "none" }).cap).toBe(15);
    expect(computeSeriesCap({ keyTrainers: trainers, defeated: new Set(), config, mode: "freeroam" }).cap).toBe(100);
  });

  it("unmarking Roark with Mars still marked drops the cap back to 15", () => {
    expect(cap([MARS]).cap).toBe(15);
    expect(cap([MARS]).available.map((t) => t.id)).toEqual([ROARK, JUPITER]); // Jupiter tambem: o pre-requisito Mars segue marcado
  });

  it("inconsistent data (pending but none available) -> 100 with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const r = computeSeriesCap({
      keyTrainers: [{ ...trainers[1]!, requiredDefeats: [["missing_id"]] }],
      defeated: new Set(),
      config,
      mode: "series",
    });
    expect(r).toMatchObject({ cap: 100, reason: "inconsistent" });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("a prerequisite cycle falls back to the trainer's own level", () => {
    const a = { ...trainers[0]!, id: "a", maxTeamLevel: 10, requiredDefeats: [["b"]] };
    const b = { ...trainers[0]!, id: "b", maxTeamLevel: 12, requiredDefeats: [["a"]] };
    const byId = new Map([a, b].map((t) => [t.id, t]));
    expect(computeTrainerLevel(a, byId, 0)).toBe(12);
  });
});

describe("requiredDefeats AND/OR and availability", () => {
  it("AND between groups, OR inside a group, empty group satisfied", () => {
    const d = new Set(["x", "y"]);
    expect(requiredDefeatsSatisfied([["x", "z"], ["y"]], d)).toBe(true);
    expect(requiredDefeatsSatisfied([["x"], ["z"]], d)).toBe(false);
    expect(requiredDefeatsSatisfied([[]], new Set())).toBe(true);
    expect(requiredDefeatsSatisfied([], new Set())).toBe(true);
    expect(isAvailable({ id: "x", requiredDefeats: [] }, d)).toBe(false);
  });
});

describe("series completion, unlock and freeroam", () => {
  const series = (id: string, keys: string[], requiredSeries: string[][] = [], special: "freeroam" | null = null): SeriesInfo => ({
    id,
    title: { pt: id, en: id },
    description: { pt: "", en: "" },
    difficulty: null,
    requiredSeries,
    special,
    keyTrainerIds: keys,
    trainersFile: `trainers/${id}.json`,
  });
  const bdsp = series("bdsp", [ROARK, MARS]);
  const atm = series("atm_team", ["t1"], [["bdsp"]]);
  const free = series("freeroam", [], [], "freeroam");
  const all = [bdsp, atm, free];

  it("completion and requiredSeries", () => {
    expect(isSeriesCompleted(bdsp, new Set([ROARK]))).toBe(false);
    expect(isSeriesUnlocked(atm, all, new Set([ROARK]))).toBe(false);
    expect(isSeriesUnlocked(atm, all, new Set([ROARK, MARS]))).toBe(true);
    expect(isSeriesUnlocked(bdsp, all, new Set())).toBe(true);
  });

  it("freeroam requires a completed series unless the config says otherwise", () => {
    expect(isFreeroamUnlocked(all, new Set(), config)).toBe(false);
    expect(isSeriesUnlocked(free, all, new Set([ROARK, MARS]), config)).toBe(true);
    expect(isFreeroamUnlocked(all, new Set(), { freeroamRequiresCompletedSeries: false })).toBe(true);
  });

  it("progress helpers: defeated union across series and cap mode", () => {
    const progress = {
      activeSeriesId: "bdsp",
      freeroam: { active: false, pausedSeriesId: null },
      series: { bdsp: { defeated: { [ROARK]: { at: 1 } } }, atm_team: { defeated: { t1: { at: 2 } } } },
    };
    expect([...defeatedSet(progress)].sort()).toEqual([ROARK, "t1"].sort());
    expect(capModeFromProgress(progress)).toBe("series");
    expect(capModeFromProgress({ ...progress, activeSeriesId: null })).toBe("none");
    expect(capModeFromProgress({ ...progress, freeroam: { active: true, pausedSeriesId: "bdsp" } })).toBe("freeroam");
  });
});

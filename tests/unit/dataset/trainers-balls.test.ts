// B5.1, B5.2, B4.3: treinadores, series/ordem/level cap e pokebolas, contra o snapshot real
// (data-source/atm-1.3.0). Nunca escreve em public/data (--out sob tools/dataset/out/_trainers-balls).
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { BallsFile, SeriesInfo, TrainersFile } from "../../../src/data/types";
import { runPipeline } from "../../../tools/dataset/src/index";
import { normalizeHeldItems } from "../../../tools/dataset/src/trainers/merge";
import { orderKeyTrainers } from "../../../tools/dataset/src/trainers/order";

process.env.DATASET_QUIET = "1";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const outDir = path.join(repoRoot, "tools/dataset/out/_trainers-balls");
const dataFile = (rel: string) => JSON.parse(readFileSync(path.join(outDir, "data", rel), "utf8"));

describe("balls stage (B4.3) on the real snapshot", () => {
  it("48 balls, one rule per catalog id, matching the curated table", async () => {
    const ctx = await runPipeline(["--only", "balls", "--out", "tools/dataset/out/_trainers-balls"]);
    expect(ctx.counts.balls).toBe(48);

    const balls = dataFile("balls.json") as BallsFile;
    expect(balls).toHaveLength(48);

    const byId = new Map(balls.map((b) => [b.id, b]));
    const netBall = byId.get("net_ball");
    expect(netBall?.rule.kind).toBe("conditional");
    expect(netBall?.rule.kind === "conditional" ? netBall.rule.applies?.types : undefined).toEqual(["water", "bug"]);

    expect(byId.get("ancient_gigaton_ball")?.rule).toEqual({ kind: "flat", multiplier: 2 });
    expect(byId.get("ancient_wing_ball")?.rule).toEqual({ kind: "flat", multiplier: 1.5 });

    const heavy = byId.get("heavy_ball");
    expect(heavy?.rule).toEqual({ kind: "conditional", bestMultiplier: 4, worstMultiplier: 1, condition: "heavyTarget" });

    const park = byId.get("park_ball");
    expect(park?.rule).toEqual({ kind: "conditional", bestMultiplier: 2.5, worstMultiplier: 1, condition: "forestOrPlains" });

    expect(byId.get("sport_ball")?.rule).toEqual({ kind: "flat", multiplier: 1.5 });

    expect(byId.get("dusk_ball")?.effect.pt).toBe(
      "3.5× se o Pokémon estiver no Nível de Luz 0, e 3× se estiver no Nível de Luz 1-7",
    );
  }, 60_000);
});

describe("trainers stage (B5.1, B5.2) on the real snapshot", () => {
  it("gym_leader_roark_0395: not optional, signature item, max team level, bdsp series", async () => {
    await runPipeline(["--only", "trainers", "--out", "tools/dataset/out/_trainers-balls"]);

    const bdsp = dataFile("trainers/bdsp.json") as TrainersFile;
    const roark = bdsp.trainers.find((t) => t.id === "gym_leader_roark_0395");
    expect(roark).toBeDefined();
    expect(roark?.optional).toBe(false);
    expect(roark?.signatureItem).toBe("cobblemon:smooth_rock");
    expect(roark?.maxTeamLevel).toBe(14);

    const cedric = bdsp.trainers.find((t) => t.id === "pokemon_trainer_cedric_0445");
    expect(cedric?.requiredDefeats).toEqual([["gym_leader_gardenia_03d6"]]);

    const maylene = bdsp.trainers.find((t) => t.id === "gym_leader_maylene_03d8");
    expect(maylene?.requiredDefeats).toEqual([
      ["pokemon_trainer_cedric_0445", "pokemon_trainer_cedric_0446", "pokemon_trainer_cedric_0447"],
    ]);
  }, 60_000);

  it("series.json has atm_team.requiredSeries = [[bdsp]] and freeroam.special === freeroam", async () => {
    await runPipeline(["--only", "trainers", "--out", "tools/dataset/out/_trainers-balls"]);
    const series = dataFile("series.json") as SeriesInfo[];
    const atmTeam = series.find((s) => s.id === "atm_team");
    expect(atmTeam?.requiredSeries).toEqual([["bdsp"]]);
    const freeroam = series.find((s) => s.id === "freeroam");
    expect(freeroam?.special).toBe("freeroam");
  }, 60_000);

  it(
    "ctx.counts.keyTrainers.bdsp: applying the documented merge rule (kubejs overrides a jar id) gives " +
      "43, not the jar-only vanilla count of 33 -- see HANDOFF for the finding about kubejs turning 10 " +
      "postgame rematches (champion/E4) non-optional for bdsp",
    async () => {
      const ctx = await runPipeline(["--only", "trainers", "--out", "tools/dataset/out/_trainers-balls"]);
      expect(ctx.counts.keyTrainers?.bdsp).toBe(43);

      const series = dataFile("series.json") as SeriesInfo[];
      const bdsp = series.find((s) => s.id === "bdsp");
      expect(bdsp?.keyTrainerIds[0]).toBe("gym_leader_roark_0395");
      expect(bdsp?.keyTrainerIds).toHaveLength(43);
    },
    60_000,
  );

  it("team heldItems keeps held items given as a list (audit T1)", async () => {
    await runPipeline(["--only", "trainers", "--out", "tools/dataset/out/_trainers-balls"]);
    const rr = dataFile("trainers/radicalred.json") as TrainersFile;
    const giovanni = rr.trainers.find((t) => t.id === "boss_giovanni_0045");
    expect(giovanni?.team[0]?.species).toBe("scrafty");
    expect(giovanni?.team[0]?.heldItems).toEqual(["cobblemon:psychic_seed"]);

    const atm = dataFile("trainers/atm_team.json") as TrainersFile;
    const lego = atm.trainers.find((t) => t.id === "allthemods_trainer_lego");
    expect(lego?.team.map((m) => m.heldItems)).toEqual([
      ["cobblemon:life_orb"],
      ["mega_showdown:garchompite", "cobblemon:loaded_dice"],
      ["cobblemon:heavy_duty_boots"],
      ["cobblemon:throat_spray"],
      ["mega_showdown:baxcalibrite", "cobblemon:loaded_dice"],
      ["cobblemon:choice_band"],
    ]);
  }, 60_000);

  it("levelCapConfig matches config/rctmod-server.toml", async () => {
    const ctx = await runPipeline(["--only", "trainers", "--out", "tools/dataset/out/_trainers-balls"]);
    expect(ctx.levelCapConfig).toEqual({
      initialLevelCap: 15,
      relativeLevelCap: 0,
      initialSeries: "empty",
      freeroamRequiresCompletedSeries: true,
    });
  }, 60_000);
});

describe("normalizeHeldItems (pure, audit T1)", () => {
  it("string, list, missing, empty and junk entries", () => {
    expect(normalizeHeldItems("life_orb")).toEqual(["cobblemon:life_orb"]);
    expect(normalizeHeldItems(["psychic_seed"])).toEqual(["cobblemon:psychic_seed"]);
    expect(normalizeHeldItems(["mega_showdown:garchompite", "loaded_dice"])).toEqual(["mega_showdown:garchompite", "cobblemon:loaded_dice"]);
    expect(normalizeHeldItems(["minecraft:gold_nugget"])).toEqual(["minecraft:gold_nugget"]);
    expect(normalizeHeldItems(undefined)).toEqual([]);
    expect(normalizeHeldItems([])).toEqual([]);
    expect(normalizeHeldItems(["", 3, null, "  "])).toEqual([]);
  });
});

describe("orderKeyTrainers (pure)", () => {
  const trainer = (id: string, level: number, name: string, requiredDefeats: string[][] = []) => ({
    id,
    name,
    type: "normal",
    typeLabel: { pt: "Normal", en: "Normal" },
    optional: false,
    requiredDefeats,
    signatureItem: null,
    biomes: { whitelist: [], blacklist: [] },
    source: "rctmod" as const,
    team: [],
    maxTeamLevel: level,
    bag: [],
  });

  it("orders by prerequisite (OR-groups) and breaks ties by level then name", () => {
    const a = trainer("a", 10, "Alpha");
    const b = trainer("b", 5, "Beta", [["a"]]);
    const c = trainer("c", 5, "Charlie", [["a"]]);
    const noopReport = { warn: () => {}, section: () => {}, timing: () => {}, warnings: [], sections: {}, timings: {} } as never;
    const order = orderKeyTrainers([b, c, a], new Set(["a", "b", "c"]), noopReport);
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("a group resolved by outside-of-set members does not block (vacuously satisfied)", () => {
    const a = trainer("a", 10, "Alpha", [["outside_id"]]);
    const noopReport = { warn: () => {}, section: () => {}, timing: () => {}, warnings: [], sections: {}, timings: {} } as never;
    const order = orderKeyTrainers([a], new Set(["a", "outside_id"]), noopReport);
    expect(order).toEqual(["a"]);
  });

  it("a real cycle throws", () => {
    const a = trainer("a", 1, "Alpha", [["b"]]);
    const b = trainer("b", 1, "Beta", [["a"]]);
    const noopReport = { warn: () => {}, section: () => {}, timing: () => {}, warnings: [], sections: {}, timings: {} } as never;
    expect(() => orderKeyTrainers([a, b], new Set(["a", "b"]), noopReport)).toThrow(/E_TRAINER_ORDER_CYCLE/);
  });
});

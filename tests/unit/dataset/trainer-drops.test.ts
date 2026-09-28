// U5a (pwa-auto-update): "Drop de treinador" das loot tables do rctmod (jar + kubejs).
import path from "node:path";
import { describe, expect, it } from "vitest";
import { openSource } from "../../../tools/dataset/src/instance";
import { buildTrainerDrops, collectRctLootTables, poolChance } from "../../../tools/dataset/src/items/trainer-drops";

const snapshot = path.resolve(import.meta.dirname, "../../../data-source/atm-1.3.0");

const single = (pools: unknown[]) => ({ pools });
const itemEntry = (name: string, extra: Record<string, unknown> = {}) => ({ type: "minecraft:item", name, ...extra });
const levelRange = (min: number, max: number) => [{ condition: "rctmod:level_range", range: { min, max } }];

describe("poolChance", () => {
  it("handles fixed, uniform, constant and binomial rolls", () => {
    expect(poolChance(1, 1)).toBe(1);
    expect(poolChance({ min: 1, max: 1 }, 1)).toBe(1);
    expect(poolChance({ type: "minecraft:constant", value: 2 }, 0.5)).toBe(0.75);
    expect(poolChance({ type: "minecraft:binomial", n: 1, p: 1 }, 1)).toBe(1);
    expect(poolChance({ type: "minecraft:binomial", n: 3, p: 0.5 }, 1)).toBe(0.875);
    expect(poolChance({ min: 0, max: 1 }, 1)).toBe(0.5);
    expect(poolChance({ type: "minecraft:score" }, 1)).toBeNull();
  });
});

describe("buildTrainerDrops", () => {
  const trainers = new Map([["team_x_satherov", { name: "Satherov", series: "atm_team" }]]);

  it("maps direct items of trainers/single/<id> to the trainer, with name, series, chance and level range", () => {
    const tables = new Map<string, unknown>([
      [
        "rctmod:trainers/single/team_x_satherov",
        single([
          { rolls: { min: 1, max: 1 }, entries: [{ type: "minecraft:loot_table", value: "rctmod:trainers/groups/team_x" }] },
          { rolls: { type: "minecraft:binomial", n: 1, p: 1 }, entries: [itemEntry("allthemons:the_kitty_badge")], conditions: levelRange(90, 100) },
        ]),
      ],
      ["rctmod:trainers/groups/team_x", single([{ rolls: 1, entries: [itemEntry("cobblemon:potion")] }])],
    ]);
    const drops = buildTrainerDrops(tables, trainers);
    expect(drops.get("allthemons:the_kitty_badge")).toEqual([
      { id: "team_x_satherov", name: "Satherov", series: "atm_team", chance: 1, levelRange: { min: 90, max: 100 }, firstDefeatOnly: false },
    ]);
    // loot generico do grupo nao e drop do treinador
    expect(drops.has("cobblemon:potion")).toBe(false);
  });

  it("expands one level of rctmod:generic/** and keeps the defeat_count == 1 condition", () => {
    const tables = new Map<string, unknown>([
      [
        "rctmod:trainers/single/boss_g",
        single([{ rolls: { type: "minecraft:binomial", n: 1, p: 1 }, entries: [{ type: "minecraft:loot_table", value: "rctmod:generic/legendary/masterball", weight: 2 }] }]),
      ],
      [
        "rctmod:generic/legendary/masterball",
        single([{ rolls: { min: 1, max: 1 }, entries: [itemEntry("cobblemon:master_ball", { conditions: [{ condition: "rctmod:defeat_count", comparator: "==", count: 1 }] })] }]),
      ],
    ]);
    expect(buildTrainerDrops(tables, trainers).get("cobblemon:master_ball")).toEqual([
      { id: "boss_g", name: null, series: null, chance: 1, levelRange: null, firstDefeatOnly: true },
    ]);
  });

  it("uses weights for the chance and returns null chance for unknown conditions or functions", () => {
    const tables = new Map<string, unknown>([
      [
        "rctmod:trainers/single/t1",
        single([
          { rolls: 1, entries: [itemEntry("a:x", { weight: 1 }), itemEntry("a:y", { weight: 3 })] },
          { rolls: 1, entries: [itemEntry("a:z", { conditions: [{ condition: "minecraft:random_chance", chance: 0.1 }] })] },
          { rolls: 1, entries: [itemEntry("a:w", { functions: [{ function: "minecraft:set_count", count: 2 }] })] },
        ]),
      ],
    ]);
    const drops = buildTrainerDrops(tables, new Map());
    expect(drops.get("a:x")?.[0]?.chance).toBe(0.25);
    expect(drops.get("a:y")?.[0]?.chance).toBe(0.75);
    expect(drops.get("a:z")?.[0]?.chance).toBeNull();
    expect(drops.get("a:w")?.[0]?.chance).toBeNull();
  });
});

describe("trainer drops on the real snapshot", () => {
  it("each of the 12 allthemons badges comes from exactly its ATM Team trainer (kubejs loot tables)", () => {
    const { reader } = openSource(snapshot, () => {});
    const drops = buildTrainerDrops(collectRctLootTables({ reader }), new Map());
    const expected: Record<string, string> = {
      "allthemons:the_artist_badge": "team_allthemods_cesarzorak",
      "allthemons:the_drunk_badge": "team_allthemods_whatthedrunk",
      "allthemons:the_helpful_badge": "team_allthemods_joeychin01",
      "allthemons:the_kitty_badge": "team_allthemods_satherov",
      "allthemons:the_lobster_badge": "team_allthemods_lobsterjonn",
      "allthemons:the_microwave_badge": "team_allthemods_dragondogemaster",
      "allthemons:the_notch_badge": "team_allthemods_notch",
      "allthemons:the_ralph_badge": "team_allthemods_rosary",
      "allthemons:the_skyblock_badge": "team_allthemods_oly2o6",
      "allthemons:the_toblerone_badge": "team_allthemods_toblerone0508",
      "allthemons:the_unknown_badge": "team_allthemods_uncandango",
      "allthemons:the_vortex_badge": "team_allthemods_thevortex",
    };
    for (const [item, trainer] of Object.entries(expected)) {
      const sources = drops.get(item);
      expect(sources?.map((s) => s.id), item).toEqual([trainer]);
      expect(sources?.[0]?.chance).toBe(1);
      expect(sources?.[0]?.levelRange).toEqual({ min: 90, max: 100 });
    }
    expect(drops.get("allthemons:ancient_dna_sample")?.map((s) => s.id)).toEqual(["team_allthemods_notch"]);
    expect(drops.get("cobblemon:master_ball")?.map((s) => [s.id, s.firstDefeatOnly])).toEqual([["boss_giovanni_0045", true]]);
  });
});

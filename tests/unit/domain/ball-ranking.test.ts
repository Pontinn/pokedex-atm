// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { BallInfo, SpawnEntry } from "../../../src/data/types";
import { partitionBalls, rankBalls, type BallSpecies } from "../../../src/domain/ball-ranking";

// 48 bolas com as regras da tabela curada de B4.3 e nomes do lang do Cobblemon 1.7.3 (gerado do snapshot).
const BALLS = JSON.parse(
  readFileSync(new URL("../../fixtures/rules-storage/balls.json", import.meta.url), "utf8"),
) as BallInfo[];

const spawn = (context: string): SpawnEntry => ({
  id: `s-${context}`,
  source: "cobblemon",
  bucket: "common",
  level: "1-20",
  context,
  presets: [],
  biomes: [],
  antiBiomes: [],
  skyLight: null,
  canSeeSky: null,
  timeRange: "any",
  structures: [],
  neededBaseBlocks: [],
  extra: {},
});

const magikarp: BallSpecies = {
  types: ["water"],
  baseStats: { hp: 20, attack: 10, defence: 55, specialAttack: 15, specialDefence: 20, speed: 80 },
  labels: ["gen1"],
  spawns: [...Array(43).fill(spawn("fishing")), spawn("submerged"), spawn("submerged"), spawn("surface")],
  maleRatio: 0.5,
  weight: 100,
};

const charizard: BallSpecies = {
  types: ["fire", "flying"],
  baseStats: { hp: 78, attack: 84, defence: 78, specialAttack: 109, specialDefence: 85, speed: 100 },
  labels: ["gen1"],
  spawns: [],
  maleRatio: 0.875,
  weight: 905,
};

const label = (r: { ball: BallInfo; multiplier: number; conditional: boolean }) =>
  `${r.ball.name.en} ${r.multiplier}${r.conditional ? "c" : ""}`;

describe("rankBalls", () => {
  it("fixture has the 48 balls", () => {
    expect(BALLS).toHaveLength(48);
  });

  it("Magikarp: full ranking of 44, 2 excluded, 2 guaranteed", () => {
    const p = partitionBalls(magikarp, BALLS, { captured: false });
    const oneX = [
      "Ancient Azure Ball", "Ancient Citrine Ball", "Ancient Feather Ball", "Ancient Heavy Ball", "Ancient Ivory Ball",
      "Ancient Poké Ball", "Ancient Roseate Ball", "Ancient Slate Ball", "Ancient Verdant Ball", "Azure Ball",
      "Cherish Ball", "Citrine Ball", "Friend Ball", "Heal Ball", "Heavy Ball", "Luxury Ball", "Poké Ball",
      "Premier Ball", "Roseate Ball", "Slate Ball", "Verdant Ball",
    ].map((n) => `${n} 1`);
    expect(p.ranked.map(label)).toEqual([
      "Love Ball 8c",
      "Quick Ball 5c",
      "Dream Ball 4c", "Level Ball 4c", "Lure Ball 4c", "Moon Ball 4c", "Nest Ball 4c", "Timer Ball 4c",
      "Dive Ball 3.5c", "Dusk Ball 3.5c",
      "Net Ball 3",
      "Park Ball 2.5c",
      "Ancient Gigaton Ball 2", "Ancient Jet Ball 2", "Ancient Ultra Ball 2", "Ultra Ball 2",
      "Ancient Great Ball 1.5", "Ancient Leaden Ball 1.5", "Ancient Wing Ball 1.5", "Great Ball 1.5", "Sport Ball 1.5",
      "Safari Ball 1.5c",
      ...oneX,
      "Beast Ball 0.1",
    ]);
    expect(p.ranked).toHaveLength(44);
    expect(oneX).toHaveLength(21);
    expect(p.excluded.map((b) => b.id).sort()).toEqual(["fast_ball", "repeat_ball"]);
    expect(p.guaranteed.map((r) => r.ball.id)).toEqual(["ancient_origin_ball", "master_ball"]);
    expect(p.ranked.slice(0, 3).map((r) => r.ball.id)).toEqual(["love_ball", "quick_ball", "dream_ball"]);
    const names = p.ranked.map((r) => r.ball.id);
    expect(names.indexOf("net_ball")).toBeLessThan(names.indexOf("poke_ball"));
    expect(p.ranked.find((r) => r.ball.id === "quick_ball")?.conditionKey).toBe("firstTurn");
  });

  it("Charizard: Fast 4x unconditional right after Love and Quick; Heavy 1x between Heal and Luxury", () => {
    const r = rankBalls(charizard, BALLS, { captured: false });
    expect(r.slice(0, 3).map(label)).toEqual(["Love Ball 8c", "Quick Ball 5c", "Fast Ball 4"]);
    expect(r[3]!.conditional).toBe(true);
    const ids = r.map((x) => x.ball.id);
    expect(ids).not.toContain("net_ball");
    expect(ids).not.toContain("lure_ball");
    expect(ids).not.toContain("dive_ball");
    const heavy = r.find((x) => x.ball.id === "heavy_ball")!;
    expect(heavy).toMatchObject({ multiplier: 1, conditional: false });
    expect(ids.indexOf("heal_ball") + 1).toBe(ids.indexOf("heavy_ball"));
    expect(ids.indexOf("heavy_ball") + 1).toBe(ids.indexOf("luxury_ball"));
  });

  it("weight 3500 hg -> Heavy 4x unconditional; weight 0 -> 1x", () => {
    const heavy = (weight: number) => rankBalls({ ...charizard, weight }, BALLS, { captured: false }).find((x) => x.ball.id === "heavy_ball");
    expect(heavy(3500)).toMatchObject({ multiplier: 4, conditional: false });
    expect(heavy(0)).toMatchObject({ multiplier: 1, conditional: false });
  });

  it("captured -> Repeat 3.5x unconditional; genderless -> Love excluded; ultra beast -> Beast 5x", () => {
    const r = rankBalls(magikarp, BALLS, { captured: true });
    expect(r.find((x) => x.ball.id === "repeat_ball")).toMatchObject({ multiplier: 3.5, conditional: false });
    const p = partitionBalls({ ...magikarp, maleRatio: -1 }, BALLS, { captured: false });
    expect(p.excluded.map((b) => b.id)).toContain("love_ball");
    const ub = rankBalls({ ...charizard, labels: ["ultra_beast"] }, BALLS, { captured: false });
    expect(ub.find((x) => x.ball.id === "beast_ball")).toMatchObject({ multiplier: 5, conditional: false });
  });

  it("custom species without spawns: Lure and Dive excluded", () => {
    const p = partitionBalls({ ...charizard, spawns: [] }, BALLS, { captured: false });
    expect(p.excluded.map((b) => b.id)).toEqual(expect.arrayContaining(["lure_ball", "dive_ball"]));
  });
});

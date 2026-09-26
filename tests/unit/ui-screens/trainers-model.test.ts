// @vitest-environment node
// F8.1/F8.2: regras de exibicao da tela Treinadores contra o dataset REAL publicado (public/data/current.json).
// Level cap da BDSP: 15 / 16 / 20 / 22 / 22 com os 3 Cedric "Proximo" / 22 com um Cedric / 30 com os 3 Cedric.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { DatasetManifest, SeriesInfo, SpeciesSummary, TrainersFile } from "../../../src/data/types";
import { defeatedSet } from "../../../src/domain/level-cap";
import {
  biomeLabel,
  buildSeriesView,
  filterTrainers,
  humanizeId,
  keyTrainersOf,
  orderSeries,
  roleClass,
  seriesChips,
} from "../../../src/screens/Trainers/trainer-model";

const root = join(__dirname, "../../../public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const read = <T>(file: string): T => JSON.parse(readFileSync(join(root, version, file), "utf8")) as T;

const manifest = read<DatasetManifest>("dataset-manifest.json");
const series = read<SeriesInfo[]>("series.json");
const bdspSeries = series.find((s) => s.id === "bdsp")!;
const bdsp = read<TrainersFile>("trainers/bdsp.json").trainers;
const speciesIndex = read<SpeciesSummary[]>("species-index.json");
const speciesByDex = new Map(speciesIndex.map((s) => [s.dex, s]));
const config = manifest.levelCapConfig;
const keyTrainers = keyTrainersOf(bdspSeries, bdsp);

const ROARK = "gym_leader_roark_0395";
const MARS = "commander_mars_03c2";
const JUPITER = "commander_jupiter_041d";
const GARDENIA = "gym_leader_gardenia_03d6";
const CEDRIC = ["pokemon_trainer_cedric_0445", "pokemon_trainer_cedric_0446", "pokemon_trainer_cedric_0447"];
const MAYLENE = "gym_leader_maylene_03d8";

const view = (ids: string[]) => buildSeriesView(keyTrainers, bdsp, new Set(ids), config);

describe("F8.2 level cap on the real BDSP data", () => {
  it("key trainers follow the dataset order, only non optional", () => {
    expect(keyTrainers.length).toBe(bdspSeries.keyTrainerIds.length);
    expect(keyTrainers.every((t) => !t.optional)).toBe(true);
    expect(keyTrainers[0]!.id).toBe(ROARK);
  });

  it("15 / 16 / 20 / 22 and the 3 Cedric as next after Gardenia", () => {
    expect(view([]).cap.cap).toBe(15);
    expect(view([]).cap.available.map((t) => t.id)).toEqual([ROARK]);
    expect(view([ROARK]).cap.cap).toBe(16);
    expect(view([ROARK, MARS]).cap.cap).toBe(20);
    expect(view([ROARK, MARS, JUPITER]).cap.cap).toBe(22);
    const afterGardenia = view([ROARK, MARS, JUPITER, GARDENIA]);
    expect(afterGardenia.cap.cap).toBe(22);
    expect(afterGardenia.cap.available.map((t) => t.id).sort()).toEqual([...CEDRIC].sort());
    for (const id of CEDRIC) expect(afterGardenia.states.get(id)).toBe("next");
    expect(afterGardenia.states.get(MAYLENE)).toBe("locked");
  });

  it("one Cedric keeps the cap at 22, all 3 Cedric then Maylene = 30", () => {
    const one = view([ROARK, MARS, JUPITER, GARDENIA, CEDRIC[0]!]);
    expect(one.cap.cap).toBe(22);
    expect(one.states.get(MAYLENE)).toBe("next");
    const three = view([ROARK, MARS, JUPITER, GARDENIA, ...CEDRIC]);
    expect(three.cap.cap).toBe(30);
    expect(three.cap.available.map((t) => t.id)).toEqual([MAYLENE]);
    expect(three.defeatedCount).toBe(7);
  });

  it("unmarking a trainer in the middle keeps dependents defeated but blocked, and the cap goes down", () => {
    const v = view([ROARK, JUPITER, GARDENIA]);
    expect(v.states.get(JUPITER)).toBe("done");
    expect(v.blocked.has(JUPITER)).toBe(true);
    expect(v.states.get(MARS)).toBe("next");
    expect(v.cap.cap).toBe(16);
  });

  it("the Cap -> N chip is the cap reached after defeating that trainer (and every one before it)", () => {
    const v = view([]);
    expect(v.levels.get(ROARK)).toBe(16);
    expect(v.levels.get(MARS)).toBe(20);
    expect(v.levels.get(JUPITER)).toBe(22);
    expect(v.levels.get(GARDENIA)).toBe(22);
    expect(CEDRIC.map((id) => v.levels.get(id))).toEqual([22, 22, 30]);
    // ultimo treinador da serie: serie concluida = 100
    expect(v.levels.get(keyTrainers.at(-1)!.id)).toBe(100);
    // cada chip bate com o header depois de derrotar ate aquele treinador
    keyTrainers.forEach((t, i) => {
      const prefix = keyTrainers.slice(0, i + 1).map((k) => k.id);
      expect(v.levels.get(t.id)).toBe(view(prefix).cap.cap);
    });
    // simulacao parte do progresso atual: treinadores a frente mantem o chip ao avancar na ordem
    const progressed = view([ROARK, MARS]);
    for (const t of keyTrainers.slice(2)) expect(progressed.levels.get(t.id)).toBe(v.levels.get(t.id));
  });
});

describe("F8.2 trainer search filters only the display", () => {
  it("roark finds Roark; garchomp finds trainers with Garchomp; the cap does not change", () => {
    const before = view([ROARK]).cap.cap;
    expect(filterTrainers(keyTrainers, "roark", speciesByDex).map((t) => t.id)).toEqual([ROARK]);
    expect(filterTrainers(keyTrainers, "  ROARK ", speciesByDex).map((t) => t.id)).toEqual([ROARK]);
    const garchomp = filterTrainers(keyTrainers, "garchomp", speciesByDex);
    expect(garchomp.length).toBeGreaterThan(0);
    for (const t of garchomp) expect(t.team.some((m) => m.species === "garchomp" || m.dex === 445)).toBe(true);
    expect(view([ROARK]).cap.cap).toBe(before);
    expect(filterTrainers(keyTrainers, "", speciesByDex)).toBe(keyTrainers);
    expect(filterTrainers(keyTrainers, "zzzzqq", speciesByDex)).toEqual([]);
  });

  it("matches PT names without accents (trainer type and team species)", () => {
    // "Equipe Galactica" (PT, sem acento) acha os comandantes
    const galactic = filterTrainers(keyTrainers, "galactica", speciesByDex);
    expect(galactic.map((t) => t.id)).toContain(MARS);
    // Geodude (time do Roark) pelo nome em ingles tambem funciona com UI em PT
    expect(filterTrainers(keyTrainers, "geodude", speciesByDex).map((t) => t.id)).toContain(ROARK);
  });
});

describe("F8.1 series picker", () => {
  it("atm_team locked with requirement BDSP until BDSP is complete; freeroam locked without a completed series", () => {
    const ordered = orderSeries(series);
    expect(ordered.at(-1)!.special).toBe("freeroam");
    const chips = seriesChips(ordered, new Set(), config);
    const atm = chips.find((c) => c.series.id === "atm_team")!;
    expect(atm.unlocked).toBe(false);
    expect(atm.requires).toEqual([[{ pt: "Diamante brilhante/Pérola reluzente", en: "Brilliant Diamond/Shining Pearl" }]]);
    expect(chips.find((c) => c.series.special === "freeroam")!.unlocked).toBe(false);
    expect(chips.find((c) => c.series.id === "bdsp")!.unlocked).toBe(true);

    const all = new Set(bdspSeries.keyTrainerIds);
    const done = seriesChips(ordered, all, config);
    expect(done.find((c) => c.series.id === "atm_team")!.unlocked).toBe(true);
    expect(done.find((c) => c.series.special === "freeroam")!.unlocked).toBe(true);
    expect(done.find((c) => c.series.id === "bdsp")!.completed).toBe(true);
  });

  it("defeated from every series count (defeatedSet union)", () => {
    const set = defeatedSet({ series: { bdsp: { defeated: { [ROARK]: { at: 1 } } }, other: { defeated: { x: { at: 2 } } } } });
    expect([...set].sort()).toEqual([ROARK, "x"].sort());
  });
});

describe("helpers", () => {
  it("role badges, biome labels, texture path and humanized ids", () => {
    expect(roleClass("leader")).toBe("role-leader");
    expect(roleClass("team_galactic")).toBe("role-rocket");
    expect(roleClass("e4")).toBe("role-elite");
    expect(roleClass("champ")).toBe("role-champion");
    expect(roleClass("team_allthemods_trainer")).toBe("role-other");
    const biomes = read<Record<string, { pt: string; en: string }>>("biomes.json");
    expect(biomeLabel("is_cave", biomes)).toEqual({ pt: "Caverna", en: "Cave" });
    expect(biomeLabel("is_unknown_xyz", null).en).toBe("Unknown xyz");
    expect(humanizeId("minecraft:gunpowder")).toBe("Gunpowder");
  });
});

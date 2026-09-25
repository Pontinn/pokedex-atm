// @vitest-environment node
// F9.1: grade de Pokebolas contra o dataset REAL: "Todas" = balls.json.length, busca PT/EN E tag, multiplicadores.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { BallInfo } from "../../../src/data/types";
import { BALL_FILTERS, ballMultiplier, filterBalls, isBallFilter } from "../../../src/screens/Balls/ball-model";

const root = join(__dirname, "../../../public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const balls = JSON.parse(readFileSync(join(root, version, "balls.json"), "utf8")) as BallInfo[];

describe("F9.1 ball grid", () => {
  it("'all' shows every ball of the dataset", () => {
    expect(filterBalls(balls, "all", "")).toHaveLength(balls.length);
    expect(balls.length).toBeGreaterThan(0);
  });

  it("dusk and crepusculo find the Dusk Ball; bola + water combines with AND", () => {
    expect(filterBalls(balls, "all", "dusk").map((b) => b.id)).toEqual(["dusk_ball"]);
    expect(filterBalls(balls, "all", "crepusculo").map((b) => b.id)).toEqual(["dusk_ball"]);
    const water = filterBalls(balls, "water", "");
    const both = filterBalls(balls, "water", "bola");
    expect(both.length).toBeGreaterThan(0);
    for (const b of both) {
      expect(b.tags).toContain("water");
      expect(`${b.name.pt} ${b.name.en}`.toLowerCase()).toContain("bola");
    }
    expect(both.length).toBeLessThanOrEqual(water.length);
    expect(filterBalls(balls, "first", "zzzz")).toEqual([]);
  });

  it("multiplier summary per rule kind", () => {
    const by = (id: string) => balls.find((b) => b.id === id)!;
    expect(ballMultiplier(by("great_ball"))).toEqual({ kind: "flat", text: "1.5x" });
    expect(ballMultiplier(by("master_ball"))).toEqual({ kind: "guaranteed" });
    expect(ballMultiplier(by("heavy_ball"))).toEqual({ kind: "range", worst: "1", best: "4" });
  });

  it("filter guard", () => {
    for (const f of BALL_FILTERS) expect(isBallFilter(f)).toBe(true);
    expect(isBallFilter("nope")).toBe(false);
  });
});

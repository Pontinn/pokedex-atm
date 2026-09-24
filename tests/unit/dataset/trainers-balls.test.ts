// B5.1: treinadores (rctmod + kubejs) e definicoes de spawn, contra o snapshot real
// (data-source/atm-1.3.0). Nunca escreve em public/data (--out sob tools/dataset/out/_trainers-balls).
// B5.2 e B4.3 acrescentam as demais describes deste arquivo em commits seguintes (mesmo agente).
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { TrainersFile } from "../../../src/data/types";
import { runPipeline } from "../../../tools/dataset/src/index";

process.env.DATASET_QUIET = "1";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const outDir = path.join(repoRoot, "tools/dataset/out/_trainers-balls");
const dataFile = (rel: string) => JSON.parse(readFileSync(path.join(outDir, "data", rel), "utf8"));

describe("trainers stage (B5.1) on the real snapshot", () => {
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
});

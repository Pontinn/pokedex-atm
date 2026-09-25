// F4.4: linhas da tabela de golpes (juncao com moves.json, ordem por nivel, golpe ausente).
import { describe, expect, it } from "vitest";
import type { MoveInfo, MovesFile, SpeciesMoves } from "../../../src/data/types";
import { buildMoveRows } from "../../../src/screens/Detail/MovesPanel";

const move = (id: string): MoveInfo => ({
  id,
  name: { pt: id.toUpperCase(), en: id },
  description: { pt: "", en: "" },
  type: "fire",
  category: "special",
  power: 90,
  accuracy: 100,
  pp: 15,
  pokeapiId: 1,
});
const file: MovesFile = { ember: move("ember"), flamethrower: move("flamethrower"), growl: move("growl") };
const moves: SpeciesMoves = {
  level: [
    { level: 30, move: "flamethrower" },
    { level: 1, move: "growl" },
    { level: 1, move: "ember" },
  ],
  tm: ["flamethrower", "unknownmove"],
  egg: [],
  tutor: [],
};

describe("buildMoveRows", () => {
  it("level tab sorted by level asc, stable for ties", () => {
    const rows = buildMoveRows(moves, "level", file);
    expect(rows.map((r) => [r.level, r.id])).toEqual([
      [1, "growl"],
      [1, "ember"],
      [30, "flamethrower"],
    ]);
    expect(rows[2]?.info?.pp).toBe(15);
  });
  it("tm tab keeps the order, level null, missing move has info null", () => {
    const rows = buildMoveRows(moves, "tm", file);
    expect(rows.map((r) => r.key)).toEqual(["flamethrower", "unknownmove"]);
    expect(rows[0]?.level).toBeNull();
    expect(rows[1]?.info).toBeNull();
  });
  it("empty tab yields no rows", () => {
    expect(buildMoveRows(moves, "egg", file)).toEqual([]);
  });
});

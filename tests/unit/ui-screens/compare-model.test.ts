// @vitest-environment node
// F7.1: regras puras de Comparar (vencedor por linha e lados iniciais pelo historico).
import { describe, expect, it } from "vitest";
import { compareDefaults, winner } from "../../../src/screens/Compare/compare-model";

describe("F7.1 compare", () => {
  it("winner: higher value wins; tie, same Pokemon or empty side = none", () => {
    expect(winner(78, 70)).toBe("left");
    expect(winner(84, 110)).toBe("right");
    expect(winner(100, 100)).toBeNull();
    expect(winner(null, 50)).toBeNull();
  });

  it("defaults: params first, else the last 2 of history, else empty", () => {
    const history = [
      { dex: 448, viewedAt: 3 },
      { dex: 6, viewedAt: 2 },
      { dex: 25, viewedAt: 1 },
    ];
    expect(compareDefaults({}, history)).toEqual({ left: 448, right: 6 });
    expect(compareDefaults({ left: 150 }, history)).toEqual({ left: 150, right: 448 });
    expect(compareDefaults({ left: 1, right: 4 }, history)).toEqual({ left: 1, right: 4 });
    expect(compareDefaults({}, [{ dex: 6, viewedAt: 1 }])).toEqual({ left: 6, right: null });
    expect(compareDefaults({}, [])).toEqual({ left: null, right: null });
  });
});

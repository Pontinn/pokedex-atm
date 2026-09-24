import { describe, expect, it } from "vitest";
import { THEME_IDS } from "../../../src/styles/themes";
import { HEAVY_BALL_BANDS, heavyBallMultiplier } from "../../../src/domain/ball-rules-types";
import { normalizeSearch } from "../../../src/domain/normalize";

describe("frozen shared contracts (B1.5)", () => {
  it("THEME_IDS keeps the canonical RF-79 order", () => {
    expect(THEME_IDS.length).toBe(7);
    expect(THEME_IDS[0]).toBe("classic");
    expect([...THEME_IDS]).toEqual(["classic", "black", "green", "blue", "purple", "white", "orange"]);
  });

  it("heavyBallMultiplier follows HEAVY_BALL_BANDS", () => {
    expect(HEAVY_BALL_BANDS).toHaveLength(4);
    expect(heavyBallMultiplier(905)).toBe(1);
    expect(heavyBallMultiplier(1000)).toBe(1);
    expect(heavyBallMultiplier(1001)).toBe(2);
    expect(heavyBallMultiplier(2001)).toBe(3);
    expect(heavyBallMultiplier(3500)).toBe(4);
    expect(heavyBallMultiplier(0)).toBe(1);
    expect(heavyBallMultiplier(null)).toBe(1);
    expect(heavyBallMultiplier(undefined)).toBe(1);
  });

  it("normalizeSearch strips accents, lowercases and trims", () => {
    expect(normalizeSearch("Pântano")).toBe("pantano");
    expect(normalizeSearch("  Flabébé ")).toBe("flabebe");
    expect(normalizeSearch("")).toBe("");
  });
});

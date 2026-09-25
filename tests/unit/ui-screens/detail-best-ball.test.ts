// F5.3: textos e bonus do painel Melhor Pokebola (rankBalls do B6.4 tem teste proprio).
import { describe, expect, it } from "vitest";
import type { BallInfo } from "../../../src/data/types";
import type { RankedBall } from "../../../src/domain/ball-ranking";
import { MESSAGES } from "../../../src/i18n/messages";
import { interpolate } from "../../../src/i18n/useT";
import { bestBallReason, criticalBonus, formatMultiplier } from "../../../src/screens/Detail/BestBallPanel";

const t = ((key: string, vars?: Record<string, string | number>) => interpolate((MESSAGES as Record<string, { pt: string }>)[key]!.pt, vars)) as never;
const ball = (rule: BallInfo["rule"]): BallInfo => ({ id: "x_ball", itemId: "cobblemon:x_ball", name: { pt: "X", en: "X" }, effect: { pt: "", en: "" }, rule, tags: [] });
const ranked = (b: BallInfo, multiplier: number, conditional: boolean): RankedBall => ({
  ball: b,
  multiplier,
  conditional,
  conditionKey: b.rule.kind === "conditional" && conditional ? b.rule.condition : null,
  guaranteed: false,
});
const species = { baseStats: { hp: 20, attack: 10, defense: 55, specialAttack: 15, specialDefense: 20, speed: 80 }, weight: 100 };

describe("best ball panel helpers", () => {
  it("formats multipliers with a dot and no trailing zeros", () => {
    expect(formatMultiplier(3.5)).toBe("3.5x");
    expect(formatMultiplier(3)).toBe("3x");
    expect(formatMultiplier(0.1)).toBe("0.1x");
  });

  it("critical capture bonus follows the caught-count bands", () => {
    expect([0, 30, 31, 150, 151, 300, 301, 450, 451, 600, 601].map(criticalBonus)).toEqual([0, 0, 0.5, 0.5, 1, 1, 1.5, 1.5, 2, 2, 2.5]);
  });

  it("reason: external condition, intrinsic type, flat", () => {
    const dusk = ball({ kind: "conditional", bestMultiplier: 3.5, worstMultiplier: 1, condition: "lightLevel0" });
    expect(bestBallReason(ranked(dusk, 3.5, true), species as never, t, "pt")).toBe("3.5x com luz 0");
    const net = ball({ kind: "conditional", bestMultiplier: 3, worstMultiplier: 1, condition: "hasAnyType", applies: { types: ["water", "bug"] } });
    expect(bestBallReason(ranked(net, 3, false), species as never, t, "pt")).toBe("Tipo Água / Inseto");
    expect(bestBallReason(ranked(ball({ kind: "flat", multiplier: 1 }), 1, false), species as never, t, "pt")).toBe("Sem condição");
    const heavy = ball({ kind: "conditional", bestMultiplier: 4, worstMultiplier: 1, condition: "heavyTarget" });
    expect(bestBallReason(ranked(heavy, 1, false), species as never, t, "pt")).toBe("Pelo peso (10 kg)");
  });
});

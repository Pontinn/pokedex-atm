// F4.3: texto exato do metodo de evolucao (nunca inventa; "Condicao especial" para o que nao se conhece).
import { describe, expect, it } from "vitest";
import type { EvolutionEdge } from "../../../src/data/types";
import { translate } from "../../../src/i18n/useT";
import { itemTexture, methodParts } from "../../../src/screens/Detail/EvolutionPanel";

const t = (k: string, v?: Record<string, string | number>) => translate("pt", k, v);
const edge = (p: Partial<EvolutionEdge>): EvolutionEdge => ({ id: "e", from: 1, to: 2, toSlug: "x", variant: "level_up", requiredItem: null, requirements: [], ...p });

describe("methodParts", () => {
  it("level, friendship + time, friendship + move type, trade, other", () => {
    expect(methodParts(edge({ requirements: [{ kind: "level", minLevel: 16 }] }), t, "pt", (i) => i)).toEqual(["Nível 16"]);
    expect(methodParts(edge({ requirements: [{ kind: "friendship", amount: 160 }, { kind: "timeRange", range: "day" }] }), t, "pt", (i) => i)).toEqual(["Amizade 160", "de dia"]);
    expect(methodParts(edge({ requirements: [{ kind: "friendship", amount: 160 }, { kind: "hasMoveType", type: "fairy" }] }), t, "pt", (i) => i)).toEqual(["Amizade 160", "sabendo golpe de Fada"]);
    expect(methodParts(edge({ variant: "trade" }), t, "pt", (i) => i)).toEqual(["Troca"]);
    expect(methodParts(edge({ requirements: [{ kind: "other", raw: { x: 1 } }] }), t, "pt", (i) => i)).toEqual(["Condição especial"]);
  });
  it("item edge has no extra text; texture path is made relative to /assets/items/", () => {
    expect(methodParts(edge({ variant: "item_interact", requiredItem: "cobblemon:thunder_stone" }), t, "pt", (i) => i)).toEqual([]);
    expect(itemTexture("assets/items/cobblemon/evolution/thunder_stone.png")).toBe("cobblemon/evolution/thunder_stone.png");
    expect(itemTexture(null)).toBeNull();
  });
});

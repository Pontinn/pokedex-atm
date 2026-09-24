// B4.3: tabela curada de regras de multiplicador por bola, derivada LITERALMENTE dos tooltips
// item.cobblemon.<id>.tooltip (en_us/pt_br) de Cobblemon-neoforge-1.7.3+1.21.1.jar, reconferidos em
// 2026-09-24 contra data-source/atm-1.3.0 (os 48 textos batem exatamente com a tabela da SPEC B4.3,
// nenhum mismatch encontrado). Nenhum arquivo data/ do Cobblemon define multiplicador: o tooltip e a fonte.
import type { BallRule, BallTag } from "../../../../src/data/types";

export interface CuratedBallRule {
  rule: BallRule;
  tags: BallTag[];
}

// -----------------------------------------------------------------------------------------------
// `BallCondition` (src/data/types.ts) foi estendida (Onda 2, commit "fix(contracts): ball conditions
// for fast and net balls") com "minBaseSpeedAbove" e "hasAnyType" para fast_ball/net_ball, que sao
// intrinsecas (o rankBalls do dominio ja resolve por `applies.minBaseSpeed`/`applies.types`, entao a
// extensao e so para o nome da condicao existir na uniao oficial e nao exigir cast).

/** Uma entrada por id do catalogo (48); build falha (runBallsStage) se faltar ou sobrar id. */
export const BALL_RULES: Readonly<Record<string, CuratedBallRule>> = {
  // "1x catch rate" (8)
  poke_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  premier_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  cherish_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  slate_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  azure_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  verdant_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  roseate_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  citrine_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },

  great_ball: { rule: { kind: "flat", multiplier: 1.5 }, tags: [] },
  sport_ball: { rule: { kind: "flat", multiplier: 1.5 }, tags: [] },
  ultra_ball: { rule: { kind: "flat", multiplier: 2 }, tags: [] },

  master_ball: { rule: { kind: "guaranteed" }, tags: [] },
  ancient_origin_ball: { rule: { kind: "guaranteed" }, tags: [] },

  safari_ball: {
    rule: { kind: "conditional", bestMultiplier: 1.5, worstMultiplier: 1, condition: "outsideBattle" },
    tags: [],
  },
  park_ball: {
    rule: { kind: "conditional", bestMultiplier: 2.5, worstMultiplier: 1, condition: "forestOrPlains" },
    tags: [],
  },
  fast_ball: {
    rule: {
      kind: "conditional",
      bestMultiplier: 4,
      worstMultiplier: 1,
      condition: "minBaseSpeedAbove",
      applies: { minBaseSpeed: 100 },
    },
    tags: [],
  },
  net_ball: {
    rule: {
      kind: "conditional",
      bestMultiplier: 3,
      worstMultiplier: 1,
      condition: "hasAnyType",
      applies: { types: ["water", "bug"] },
    },
    tags: ["water"],
  },
  heavy_ball: {
    // heavyTarget NAO usa applies (intrinseca, HEAVY_BALL_BANDS de src/domain/ball-rules-types.ts).
    rule: { kind: "conditional", bestMultiplier: 4, worstMultiplier: 1, condition: "heavyTarget" },
    tags: [],
  },
  level_ball: {
    rule: { kind: "conditional", bestMultiplier: 4, worstMultiplier: 1, condition: "playerLevelHigher" },
    tags: [],
  },
  lure_ball: {
    rule: {
      kind: "conditional",
      bestMultiplier: 4,
      worstMultiplier: 1,
      condition: "fishing",
      applies: { spawnContext: ["fishing"] },
    },
    tags: ["water", "fishing"],
  },
  moon_ball: {
    rule: { kind: "conditional", bestMultiplier: 4, worstMultiplier: 1, condition: "fullMoonNight" },
    tags: ["night"],
  },
  love_ball: {
    rule: {
      kind: "conditional",
      bestMultiplier: 8,
      worstMultiplier: 1,
      condition: "oppositeGender",
      applies: { genderless: false },
    },
    tags: [],
  },
  dive_ball: {
    rule: {
      kind: "conditional",
      bestMultiplier: 3.5,
      worstMultiplier: 1,
      condition: "submerged",
      applies: { spawnContext: ["submerged"] },
    },
    tags: ["water"],
  },
  nest_ball: {
    rule: { kind: "conditional", bestMultiplier: 4, worstMultiplier: 1, condition: "targetLevelBelow30" },
    tags: [],
  },
  repeat_ball: {
    rule: { kind: "conditional", bestMultiplier: 3.5, worstMultiplier: 1, condition: "registeredCaught" },
    tags: ["caught"],
  },
  timer_ball: {
    rule: { kind: "conditional", bestMultiplier: 4, worstMultiplier: 1, condition: "turn10" },
    tags: [],
  },
  dusk_ball: {
    rule: { kind: "conditional", bestMultiplier: 3.5, worstMultiplier: 1, condition: "lightLevel0" },
    tags: ["night"],
  },
  quick_ball: {
    rule: { kind: "conditional", bestMultiplier: 5, worstMultiplier: 1, condition: "firstTurn" },
    tags: ["first"],
  },
  dream_ball: {
    rule: { kind: "conditional", bestMultiplier: 4, worstMultiplier: 1, condition: "sleeping" },
    tags: [],
  },
  beast_ball: {
    rule: {
      kind: "conditional",
      bestMultiplier: 5,
      worstMultiplier: 0.1,
      condition: "ultraBeast",
      applies: { label: "ultra_beast" },
    },
    tags: [],
  },

  friend_ball: { rule: { kind: "flat", multiplier: 1 }, tags: ["after"] },
  luxury_ball: { rule: { kind: "flat", multiplier: 1 }, tags: ["after"] },
  heal_ball: { rule: { kind: "flat", multiplier: 1 }, tags: ["after"] },

  // ancestrais "1x catch rate" (7)
  ancient_poke_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  ancient_citrine_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  ancient_verdant_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  ancient_azure_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  ancient_roseate_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  ancient_slate_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  ancient_ivory_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },

  ancient_great_ball: { rule: { kind: "flat", multiplier: 1.5 }, tags: [] },
  ancient_ultra_ball: { rule: { kind: "flat", multiplier: 2 }, tags: [] },

  // "flies further" (nao dependem do peso, diferente da Heavy Ball)
  ancient_feather_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  ancient_wing_ball: { rule: { kind: "flat", multiplier: 1.5 }, tags: [] },
  ancient_jet_ball: { rule: { kind: "flat", multiplier: 2 }, tags: [] },

  // "throws less far" (nao dependem do peso, diferente da Heavy Ball)
  ancient_heavy_ball: { rule: { kind: "flat", multiplier: 1 }, tags: [] },
  ancient_leaden_ball: { rule: { kind: "flat", multiplier: 1.5 }, tags: [] },
  ancient_gigaton_ball: { rule: { kind: "flat", multiplier: 2 }, tags: [] },
};

export const EXPECTED_BALL_COUNT = 48;

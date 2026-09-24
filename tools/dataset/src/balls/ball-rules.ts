// B4.3: tabela curada de regras de multiplicador por bola, derivada LITERALMENTE dos tooltips
// item.cobblemon.<id>.tooltip (en_us/pt_br) de Cobblemon-neoforge-1.7.3+1.21.1.jar, reconferidos em
// 2026-09-24 contra data-source/atm-1.3.0 (os 48 textos batem exatamente com a tabela da SPEC B4.3,
// nenhum mismatch encontrado). Nenhum arquivo data/ do Cobblemon define multiplicador: o tooltip e a fonte.
import type { BallCondition, BallRule, BallTag } from "../../../../src/data/types";

export interface CuratedBallRule {
  rule: BallRule;
  tags: BallTag[];
}

// -----------------------------------------------------------------------------------------------
// GAP DE CONTRATO (reportar ao orquestrador): `BallCondition` (src/data/types.ts, congelado B1.5) tem
// 15 valores, um para cada bola condicional "por nome" (safari->outsideBattle, park->forestOrPlains,
// heavy->heavyTarget, level->playerLevelHigher, lure->fishing, moon->fullMoonNight, love->oppositeGender,
// dive->submerged, nest->targetLevelBelow30, repeat->registeredCaught, timer->turn10, dusk->lightLevel0,
// quick->firstTurn, dream->sleeping, beast->ultraBeast) -- todos os 15 ja usados 1:1. A tabela da SPEC B4.3
// pede MAIS DUAS bolas condicionais, `fast_ball` (applies.minBaseSpeed >= 100) e `net_ball`
// (applies.types intersecta [water,bug]), que precisariam de um BallCondition proprio (ex.
// "minBaseSpeedAbove", "hasAnyType") para o dominio (B6.4 rankBalls) diferenciar a logica de runtime.
// Reutilizar um dos 15 nomes existentes faria o rankBalls aplicar a logica ERRADA (ex. checar bioma ou
// fase da lua) para fast_ball/net_ball. Como o tipo esta congelado e nao pode ser editado aqui, uso os
// dois literais abaixo (fora da uniao oficial) via cast documentado, e reporto o gap no HANDOFF para o
// orquestrador estender `BallCondition` (a extensao NAO quebra nada existente: e so adicionar 2 valores).
type PendingBallCondition = "minBaseSpeedAbove" | "hasAnyType";
function pendingCondition(value: PendingBallCondition): BallCondition {
  // cast documentado: valor fora da uniao oficial, ver nota do GAP DE CONTRATO acima.
  return value as unknown as BallCondition;
}

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
      condition: pendingCondition("minBaseSpeedAbove"),
      applies: { minBaseSpeed: 100 },
    },
    tags: [],
  },
  net_ball: {
    rule: {
      kind: "conditional",
      bestMultiplier: 3,
      worstMultiplier: 1,
      condition: pendingCondition("hasAnyType"),
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

// Modelo puro da pagina Tipos (type-chart): deriva grupos, matriz e regras de selecao de src/domain/type-chart.ts.
import type { TypeId, TypeMultiplier } from "../../data/types";
import { TYPE_IDS, effectivenessAgainst, singleMultiplier, typeChartMatrix, type Effectiveness } from "../../domain/type-chart";
import type { MessageKey } from "../../i18n/messages";
import type { UiStateMap } from "../../navigation/types";

export type TypesUi = UiStateMap["types"];
/** Tom de cor (vantagem do ponto de vista da visao); o hex mora so em types.css. */
export type Tone = "adv" | "dis" | "zero" | "dis-strong" | "adv-strong" | "neutral";
export interface TypeGroup {
  multiplier: Exclude<Effectiveness, 1>;
  tone: Tone;
  titleKey: MessageKey;
  types: TypeId[];
}
export interface MatrixCell {
  attacker: TypeId;
  defender: TypeId;
  multiplier: TypeMultiplier;
  symbol: string;
  tone: Tone;
}
export interface MatrixRow {
  attacker: TypeId;
  cells: MatrixCell[];
}

export const MULT_SYMBOL: Readonly<Record<Effectiveness, string>> = { 4: "x4", 2: "x2", 1: "x1", 0.5: "x1/2", 0.25: "x1/4", 0: "x0" };
export const CELL_SYMBOL: Readonly<Record<TypeMultiplier, string>> = { 2: "2", 1: "", 0.5: "1/2", 0: "0" };
export const TYPE_NAME_JOIN = " / ";
export const HINT_KEYS = {
  normal: "types.hint.normal",
  fire: "types.hint.fire",
  water: "types.hint.water",
  electric: "types.hint.electric",
  grass: "types.hint.grass",
  ice: "types.hint.ice",
  fighting: "types.hint.fighting",
  poison: "types.hint.poison",
  ground: "types.hint.ground",
  flying: "types.hint.flying",
  psychic: "types.hint.psychic",
  bug: "types.hint.bug",
  rock: "types.hint.rock",
  ghost: "types.hint.ghost",
  dragon: "types.hint.dragon",
  dark: "types.hint.dark",
  steel: "types.hint.steel",
  fairy: "types.hint.fairy",
} as const satisfies Record<TypeId, MessageKey>;

type GroupSpec = Omit<TypeGroup, "types">;

const ATTACK_SPEC: readonly GroupSpec[] = [
  { multiplier: 2, tone: "adv", titleKey: "types.atk2" },
  { multiplier: 0.5, tone: "dis", titleKey: "types.atkHalf" },
  { multiplier: 0, tone: "zero", titleKey: "types.atk0" },
];

const DEFEND_SINGLE_SPEC: readonly GroupSpec[] = [
  { multiplier: 2, tone: "dis", titleKey: "types.def2" },
  { multiplier: 0.5, tone: "adv", titleKey: "types.defHalf" },
  { multiplier: 0, tone: "zero", titleKey: "types.def0" },
];

export function isTypeId(v: unknown): v is TypeId {
  return typeof v === "string" && (TYPE_IDS as readonly string[]).includes(v);
}

/** Tom da matriz (otica de quem ataca): 2 vantagem, 1/2 desvantagem, 0 nao afeta, 1 neutro. */
export function toneOf(m: TypeMultiplier): Tone {
  switch (m) {
    case 2:
      return "adv";
    case 0.5:
      return "dis";
    case 0:
      return "zero";
    default:
      return "neutral";
  }
}

/** Grupos do tipo atacando: x2, x1/2, x0 (sempre os 3, ordem de TYPE_IDS, grupo vazio = []). */
export function attackGroups(type: TypeId): TypeGroup[] {
  return ATTACK_SPEC.map((g) => ({ ...g, types: TYPE_IDS.filter((d) => singleMultiplier(type, d) === g.multiplier) }));
}

/** Grupos do(s) tipo(s) defendendo: quem causa x2, x1/2, x0 neles (sempre os 3, nunca omitidos). */
export function defendGroups(defenders: readonly TypeId[]): TypeGroup[] {
  // F4.1: ramo de 2 tipos
  const first = defenders[0];
  const e = effectivenessAgainst(first !== undefined ? [first] : []);
  return DEFEND_SINGLE_SPEC.map((g) => ({ ...g, types: TYPE_IDS.filter((a) => e[a] === g.multiplier) }));
}

/** Matriz 18 x 18 (linha = atacante, coluna = defensor), ordem de TYPE_IDS nos dois eixos. */
export function matrixRows(): MatrixRow[] {
  const matrix = typeChartMatrix();
  return TYPE_IDS.map((attacker) => ({
    attacker,
    cells: TYPE_IDS.map((defender) => {
      const multiplier = matrix[attacker][defender];
      return { attacker, defender, multiplier, symbol: CELL_SYMBOL[multiplier], tone: toneOf(multiplier) };
    }),
  }));
}

/** Patch de selecao ao escolher `picked` (null = no-op: tipo ja selecionado). Escolher o 2o tipo como 1o limpa o 2o. */
export function nextSelection(ui: Pick<TypesUi, "selected" | "second">, picked: TypeId): Partial<TypesUi> | null {
  if (ui.selected === picked) return null;
  if (ui.second === picked) return { selected: picked, second: null };
  return { selected: picked };
}

/** Opcoes do 2o tipo: os 17 de TYPE_IDS sem o 1o, ordem canonica. */
export function secondOptions(first: TypeId): TypeId[] {
  return TYPE_IDS.filter((t) => t !== first);
}

/** Valor do select do 2o tipo: vazio, desconhecido ou igual ao 1o -> null. */
export function parseSecond(value: string, first: TypeId): TypeId | null {
  return isTypeId(value) && value !== first ? value : null;
}

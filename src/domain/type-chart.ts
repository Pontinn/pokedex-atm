// Tabela de tipos (RF-17, RF-34), portada literalmente de design/prototipo/app.js:280-299.
// Formato: atacante -> { 2: [defensores], 0.5: [defensores], 0: [defensores] }; o resto e x1.
import type { TypeId, TypeMultiplier } from "../data/types";

export const TYPE_IDS: readonly TypeId[] = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export interface AttackerRow {
  2: readonly TypeId[];
  0.5: readonly TypeId[];
  0: readonly TypeId[];
}

export const TYPE_CHART: Readonly<Record<TypeId, AttackerRow>> = {
  normal: { 2: [], 0.5: ["rock", "steel"], 0: ["ghost"] },
  fire: { 2: ["grass", "ice", "bug", "steel"], 0.5: ["fire", "water", "rock", "dragon"], 0: [] },
  water: { 2: ["fire", "ground", "rock"], 0.5: ["water", "grass", "dragon"], 0: [] },
  electric: { 2: ["water", "flying"], 0.5: ["electric", "grass", "dragon"], 0: ["ground"] },
  grass: { 2: ["water", "ground", "rock"], 0.5: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], 0: [] },
  ice: { 2: ["grass", "ground", "flying", "dragon"], 0.5: ["fire", "water", "ice", "steel"], 0: [] },
  fighting: { 2: ["normal", "ice", "rock", "dark", "steel"], 0.5: ["poison", "flying", "psychic", "bug", "fairy"], 0: ["ghost"] },
  poison: { 2: ["grass", "fairy"], 0.5: ["poison", "ground", "rock", "ghost"], 0: ["steel"] },
  ground: { 2: ["fire", "electric", "poison", "rock", "steel"], 0.5: ["grass", "bug"], 0: ["flying"] },
  flying: { 2: ["grass", "fighting", "bug"], 0.5: ["electric", "rock", "steel"], 0: [] },
  psychic: { 2: ["fighting", "poison"], 0.5: ["psychic", "steel"], 0: ["dark"] },
  bug: { 2: ["grass", "psychic", "dark"], 0.5: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], 0: [] },
  rock: { 2: ["fire", "ice", "flying", "bug"], 0.5: ["fighting", "ground", "steel"], 0: [] },
  ghost: { 2: ["psychic", "ghost"], 0.5: ["dark"], 0: ["normal"] },
  dragon: { 2: ["dragon"], 0.5: ["steel"], 0: ["fairy"] },
  dark: { 2: ["psychic", "ghost"], 0.5: ["fighting", "dark", "fairy"], 0: [] },
  steel: { 2: ["ice", "rock", "fairy"], 0.5: ["fire", "water", "electric", "steel"], 0: [] },
  fairy: { 2: ["fighting", "dragon", "dark"], 0.5: ["fire", "poison", "steel"], 0: [] },
};

export type Effectiveness = 0 | 0.25 | 0.5 | 1 | 2 | 4;

/** Multiplicador de um ataque do tipo `attacker` contra UM defensor. */
export function singleMultiplier(attacker: TypeId, defender: TypeId): TypeMultiplier {
  const row = TYPE_CHART[attacker];
  if (row[2].includes(defender)) return 2;
  if (row[0.5].includes(defender)) return 0.5;
  if (row[0].includes(defender)) return 0;
  return 1;
}

/** Para cada tipo atacante, o produto dos multiplicadores contra os defensores (lista vazia -> tudo x1). */
export function effectivenessAgainst(defenders: readonly TypeId[]): Record<TypeId, Effectiveness> {
  const out = {} as Record<TypeId, Effectiveness>;
  for (const atk of TYPE_IDS) {
    let m = 1;
    for (const def of defenders) m *= singleMultiplier(atk, def);
    out[atk] = m as Effectiveness;
  }
  return out;
}

export interface MultiplierGroup {
  multiplier: Exclude<Effectiveness, 1>;
  types: TypeId[];
}

const GROUP_ORDER: readonly Exclude<Effectiveness, 1>[] = [4, 2, 0.5, 0.25, 0];

/** Linhas x4, x2, x0.5, x0.25, x0 (x1 omitido; linhas vazias omitidas), tipos na ordem canonica. */
export function groupByMultiplier(map: Readonly<Record<TypeId, Effectiveness>>): MultiplierGroup[] {
  return GROUP_ORDER.map((multiplier) => ({
    multiplier,
    types: TYPE_IDS.filter((t) => map[t] === multiplier),
  })).filter((g) => g.types.length > 0);
}

/** Matriz atacante -> defensor (formato de type-chart.json), para conferencia com o dataset em B2.5. */
export function typeChartMatrix(): Record<TypeId, Record<TypeId, TypeMultiplier>> {
  const matrix = {} as Record<TypeId, Record<TypeId, TypeMultiplier>>;
  for (const atk of TYPE_IDS) {
    matrix[atk] = {} as Record<TypeId, TypeMultiplier>;
    for (const def of TYPE_IDS) matrix[atk][def] = singleMultiplier(atk, def);
  }
  return matrix;
}

// As 25 naturezas (RF-35). Nomes do lang do Cobblemon 1.7.3 (cobblemon.nature.<id>, pt_br/en_us).
import type { BaseStats, LocalizedText } from "../data/types";

export type StatKey = keyof BaseStats;
export type BattleStatKey = Exclude<StatKey, "hp">;

export interface Nature {
  id: string;
  name: LocalizedText;
  up: BattleStatKey | null;
  down: BattleStatKey | null;
}

const n = (id: string, pt: string, en: string, up: BattleStatKey | null, down: BattleStatKey | null): Nature => ({
  id,
  name: { pt, en },
  up,
  down,
});

export const NATURES: readonly Nature[] = [
  n("hardy", "Destemida", "Hardy", null, null),
  n("lonely", "Solitária", "Lonely", "attack", "defence"),
  n("brave", "Valente", "Brave", "attack", "speed"),
  n("adamant", "Rígida", "Adamant", "attack", "specialAttack"),
  n("naughty", "Teimosa", "Naughty", "attack", "specialDefence"),
  n("bold", "Corajosa", "Bold", "defence", "attack"),
  n("docile", "Dócil", "Docile", null, null),
  n("relaxed", "Descontraída", "Relaxed", "defence", "speed"),
  n("impish", "Inquieta", "Impish", "defence", "specialAttack"),
  n("lax", "Relaxada", "Lax", "defence", "specialDefence"),
  n("timid", "Tímida", "Timid", "speed", "attack"),
  n("hasty", "Apressada", "Hasty", "speed", "defence"),
  n("serious", "Séria", "Serious", null, null),
  n("jolly", "Alegre", "Jolly", "speed", "specialAttack"),
  n("naive", "Ingênua", "Naive", "speed", "specialDefence"),
  n("modest", "Modesta", "Modest", "specialAttack", "attack"),
  n("mild", "Mansa", "Mild", "specialAttack", "defence"),
  n("quiet", "Quieta", "Quiet", "specialAttack", "speed"),
  n("bashful", "Atrapalhada", "Bashful", null, null),
  n("rash", "Imprudente", "Rash", "specialAttack", "specialDefence"),
  n("calm", "Calma", "Calm", "specialDefence", "attack"),
  n("gentle", "Gentil", "Gentle", "specialDefence", "defence"),
  n("sassy", "Atrevida", "Sassy", "specialDefence", "speed"),
  n("careful", "Cuidadosa", "Careful", "specialDefence", "specialAttack"),
  n("quirky", "Peculiar", "Quirky", null, null),
];

export function getNature(id: string): Nature | undefined {
  return NATURES.find((x) => x.id === id);
}

/** 1.1 no stat favorecido, 0.9 no prejudicado, 1 no resto (e sempre 1 em naturezas neutras). */
export function natureModifier(natureId: string | null, stat: BattleStatKey): 1.1 | 1 | 0.9 {
  const nature = natureId ? getNature(natureId) : undefined;
  if (!nature || nature.up === nature.down) return 1;
  if (nature.up === stat) return 1.1;
  if (nature.down === stat) return 0.9;
  return 1;
}

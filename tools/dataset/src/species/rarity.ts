// B2.3 (so build-time, ninguem em src/ importa): raridade a partir dos spawns de uma especie (SPEC 5.1.4).
import type { RarityBucket, RarityInfo, SpawnEntry } from "../../../../src/data/types";

/** Ordem fixa da SPEC 5.1.4: common > uncommon > rare > ultra-rare. */
export const RARITY_ORDER: readonly RarityBucket[] = ["common", "uncommon", "rare", "ultra-rare"];

export function isRarityBucket(value: unknown): value is RarityBucket {
  return typeof value === "string" && (RARITY_ORDER as readonly string[]).includes(value);
}

/**
 * primary = o bucket mais comum PRESENTE em spawns[] na ordem fixa acima (o primeiro presente, nunca pela
 * contagem de entradas: BUGFIX da auditoria A1, Dragonite com uncommon/rare/ultra-rare saia "ultra-rare"
 * porque a contagem de entradas ultra-rare era maior); secondary = os demais presentes, na mesma ordem.
 * Sem spawns -> primary null, secondary [].
 */
export function deriveRarity(spawns: readonly SpawnEntry[]): RarityInfo {
  const present = RARITY_ORDER.filter((b) => spawns.some((s) => s.bucket === b));
  if (present.length === 0) return { primary: null, secondary: [] };
  return { primary: present[0] as RarityBucket, secondary: present.slice(1) };
}

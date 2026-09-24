// B2.3 (so build-time, ninguem em src/ importa): raridade a partir dos spawns de uma especie (SPEC 5.1.4).
import type { RarityBucket, RarityInfo, SpawnEntry } from "../../../../src/data/types";

/** Ordem de confianca / desempate: common > uncommon > rare > ultra-rare. */
export const RARITY_ORDER: readonly RarityBucket[] = ["common", "uncommon", "rare", "ultra-rare"];

export function isRarityBucket(value: unknown): value is RarityBucket {
  return typeof value === "string" && (RARITY_ORDER as readonly string[]).includes(value);
}

/**
 * primary = bucket mais comum (maior contagem) presente em spawns[], desempate pela ordem acima;
 * secondary = os demais buckets presentes, na mesma ordem. Sem spawns -> primary null, secondary [].
 */
export function deriveRarity(spawns: readonly SpawnEntry[]): RarityInfo {
  if (spawns.length === 0) return { primary: null, secondary: [] };
  const counts = new Map<RarityBucket, number>();
  for (const s of spawns) counts.set(s.bucket, (counts.get(s.bucket) ?? 0) + 1);
  const present = RARITY_ORDER.filter((b) => counts.has(b));
  let primary = present[0] as RarityBucket;
  let max = counts.get(primary) ?? 0;
  for (const bucket of present) {
    const count = counts.get(bucket) ?? 0;
    if (count > max) {
      primary = bucket;
      max = count;
    }
  }
  return { primary, secondary: present.filter((b) => b !== primary) };
}

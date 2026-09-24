// B4.2 passo 2: indice invertido de SpeciesDetail.drops[] (ja achatado em B2.2) -> item.obtain "drop".
import type { DerivedSpecies } from "../species/stage-derive";
import type { PipelineContext } from "../context";

export interface DropSource {
  dex: number;
  percentage: number | null;
  quantityRange: string | null;
}

/** itemId -> especies (com dex/percentage/quantityRange) que o derrubam. */
export function buildDropsIndex(ctx: PipelineContext): Map<string, DropSource[]> {
  const out = new Map<string, DropSource[]>();
  for (const merged of ctx.species.values()) {
    const species = merged as DerivedSpecies;
    for (const drop of species.drops) {
      const list = out.get(drop.item) ?? [];
      list.push({ dex: species.dex, percentage: drop.percentage, quantityRange: drop.quantityRange });
      out.set(drop.item, list);
    }
  }
  return out;
}

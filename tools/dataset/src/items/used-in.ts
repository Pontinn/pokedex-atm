// B4.2 passo 5: indice "Usado em" (evolutions com requiredItem, fossils, formas com requiredItems, bolas).
import type { BallsFile, FossilRoute, ItemUsedIn } from "../../../../src/data/types";
import type { DerivedSpecies } from "../species/stage-derive";
import type { PipelineContext } from "../context";

export function buildUsedInIndex(
  ctx: PipelineContext,
  fossils: readonly FossilRoute[],
  balls: BallsFile,
): Map<string, ItemUsedIn> {
  const out = new Map<string, ItemUsedIn>();
  const get = (itemId: string): ItemUsedIn => {
    let entry = out.get(itemId);
    if (!entry) {
      entry = { evolutions: [], fossils: [], forms: [], ball: false };
      out.set(itemId, entry);
    }
    return entry;
  };

  for (const merged of ctx.species.values()) {
    const species = merged as DerivedSpecies;
    for (const edge of species.evolutions ?? []) {
      if (edge.requiredItem) get(edge.requiredItem).evolutions.push({ from: edge.from, to: edge.to });
    }
    for (const form of species.resolvedForms ?? []) {
      for (const itemId of form.requiredItems) get(itemId).forms.push({ dex: species.dex, form: form.name });
    }
  }
  for (const route of fossils) {
    for (const itemId of route.fossils) get(itemId).fossils.push(route.result);
  }
  for (const ball of balls) get(ball.itemId).ball = true;

  return out;
}

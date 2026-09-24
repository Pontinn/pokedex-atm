// Dono: Onda 1 - PokeAPI e midia (B3.1, B3.2); Onda 2 acrescenta B3.3 (sprites + artwork ids). index.ts ja chama esta etapa na ordem final.
import { runAbilities } from "../abilities";
import { runArtworkIds } from "../artwork-ids";
import { runMoves } from "../moves";
import { runSprites } from "../sprites";
import type { PipelineContext } from "../context";

/** Golpes e habilidades via PokeAPI (cache em ctx.cacheDir("pokeapi")); B3.3 (Onda 2): sprites 96px e ids de artwork por forma. */
export async function runPokeapiStage(ctx: PipelineContext): Promise<void> {
  await runMoves(ctx);
  runAbilities(ctx);
  await runSprites(ctx);
  await runArtworkIds(ctx);
}

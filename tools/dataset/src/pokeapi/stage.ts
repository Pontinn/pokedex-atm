// Dono: Onda 1 - PokeAPI e midia (B3.1, B3.2); Onda 2 acrescenta B3.3 (sprites + artwork ids). index.ts ja chama esta etapa na ordem final.
import { runAbilities } from "../abilities";
import { runMoves } from "../moves";
import type { PipelineContext } from "../context";

/** Golpes e habilidades via PokeAPI (cache em ctx.cacheDir("pokeapi")). Sprites/artwork (B3.3) serao acrescentados aqui na Onda 2. */
export async function runPokeapiStage(ctx: PipelineContext): Promise<void> {
  await runMoves(ctx);
  runAbilities(ctx);
}

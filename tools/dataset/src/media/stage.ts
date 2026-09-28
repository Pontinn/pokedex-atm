// Dono: Onda 1 - PokeAPI e midia (B3.4). index.ts ja chama esta etapa na ordem final.
import type { PipelineContext } from "../context";
import { checkBudget } from "./budget";
import { extractCries } from "./cries";
import { extractItemTextures } from "./item-textures";
import { extractSfx } from "./sfx";

/** Extracao de midia dos jars (gritos, sfx, texturas de item); retorna cedo com --skip-media. */
export async function runMediaStage(ctx: PipelineContext): Promise<void> {
  if (ctx.flags.skipMedia) {
    ctx.setCount("cries", 0);
    ctx.setCount("itemTextures", 0);
    ctx.report.section("mediaSkipped", true);
    return;
  }

  const cries = extractCries(ctx);
  ctx.media.register("cries", cries.files, cries.bytes);
  ctx.setCount("cries", cries.files);

  const sfx = extractSfx(ctx);
  ctx.media.register("sfx", sfx.files, sfx.bytes);

  const textures = await extractItemTextures(ctx);
  ctx.media.register("itemTextures", textures.files, textures.bytes);
  ctx.setCount("itemTextures", textures.files);
  ctx.report.section("itemTexturesAnimated", textures.animated);

  checkBudget(ctx);
}

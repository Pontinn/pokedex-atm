// B3.3 (Onda 2): sprites 96px por especie. Baixa dex 1..1025 de PokeAPI/sprites (GitHub raw) para
// <outDir>/assets/sprites/<dex>.png; cache em ctx.cacheDir("sprites"). Custom (9901/9902) sem sprite.
// 404 -> a especie fica sem arquivo (index-writer, B2.5, deriva hasSprite = arquivo existe), reportado
// como aviso (nunca falha o build: RF-09 pede placeholder na UI).
import type { PipelineContext } from "./context";
import { writeFileAtomic } from "./lib/fs-atomic";
import { createPokeapiClient, isPokeapiError, type PokeapiClient } from "./pokeapi/client";

export const SPRITE_BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
/** Sprites so existem na PokeAPI ate a National Dex atual (SPEC B3.3 passo 1); custom (9901/9902) ficam de fora. */
export const MAX_SPRITE_DEX = 1025;

export interface SpritesResult {
  /** dex que baixaram com sucesso */
  ok: number[];
  /** dex sem sprite (404 ou falha de rede sem cache) */
  failed: number[];
  totalBytes: number;
}

/**
 * Baixa um PNG por dex (1..1025) em paralelo, respeitando a fila de concorrencia do cliente
 * (SPEC: max 6). Nunca lanca por causa de um 404 isolado: registra em `failed` e no report.
 */
export async function runSprites(ctx: PipelineContext, client?: PokeapiClient): Promise<SpritesResult> {
  const pokeapi =
    client ??
    createPokeapiClient({
      cacheDir: ctx.cacheDir("pokeapi"),
      binaryCacheDir: ctx.cacheDir("sprites"),
      offline: ctx.flags.offline,
    });
  const dexes = [...ctx.species.keys()].filter((dex) => dex <= MAX_SPRITE_DEX).sort((a, b) => a - b);
  const ok: number[] = [];
  const failed: number[] = [];
  let totalBytes = 0;

  await Promise.all(
    dexes.map(async (dex) => {
      const url = `${SPRITE_BASE_URL}/${dex}.png`;
      try {
        const bytes = await pokeapi.getBinary(url);
        totalBytes += writeFileAtomic(ctx.assetPath("sprites", `${dex}.png`), bytes);
        ok.push(dex);
      } catch (error) {
        failed.push(dex);
        const detail = isPokeapiError(error) ? error.message : String(error);
        ctx.report.warn("W_SPRITE_MISSING", `sprite ausente para dex ${dex}`, { dex, detail });
      }
    }),
  );

  ctx.media.register("sprites", ok.length, totalBytes);
  ctx.setCount("sprites", ok.length);
  ctx.report.section("sprites", { ok: ok.length, failed: failed.length });
  return { ok, failed, totalBytes };
}

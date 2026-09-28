// U8 (pwa-auto-update): textura dos itens `minecraft:*` do catalogo, tirada do jar do Minecraft 1.21.1 (snapshot
// `vanilla/1.21.1.jar/`, instancia `../../Install/versions/1.21.1/1.21.1.jar`). Regra, pelo modelo do item
// `assets/minecraft/models/item/<item>.json`:
//   1. `textures.layer0` (item plano, inclusive os que apontam para `block/...`, ex. mudas e flores) = essa textura;
//   2. senao, `parent` = `minecraft:block/<b>` (item de bloco, desenhado em 3D no jogo): uma face do modelo do bloco,
//      a primeira de `all` (cube_all), `front` (orientable), `side` (cube_column, cacto); fica registrado em `blockFace`.
//   Qualquer outro caso = sem textura (`missing`, com o motivo). Nada e inventado.
// Publicado em `assets/items/minecraft/<item>.png` (nome do item, sem colisao entre item/ e block/). Textura com
// `.png.mcmeta` de animacao publica so o primeiro quadro (D5, animated-texture.ts).
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { unzipSync } from "fflate";
import type { PipelineContext } from "../context";
import { writeFileAtomic } from "../lib/fs-atomic";
import { parseLenient, vanillaJarPath } from "../items/recipes";
import { extractAnimationFrame, parseTextureAnimation } from "./animated-texture";

export type ReadVanilla = (rel: string) => Uint8Array | null;

export type VanillaTextureChoice =
  | { texture: string; via: "layer0" }
  | { texture: string; via: "blockFace"; face: string; blockModel: string }
  | { texture: null; reason: string };

const BLOCK_FACES = ["all", "front", "side"] as const;

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const bare = (ref: string) => ref.replace(/^minecraft:/, "");

/** Escolhe a textura de um item vanilla pelo modelo (regra no topo do arquivo). `texture` = "item/x" ou "block/x". */
export function chooseVanillaTexture(read: ReadVanilla, itemPath: string): VanillaTextureChoice {
  const modelBytes = read(`assets/minecraft/models/item/${itemPath}.json`);
  if (!modelBytes) return { texture: null, reason: "sem modelo de item" };
  const model = parseLenient(modelBytes);
  if (!isObject(model)) return { texture: null, reason: "modelo de item invalido" };
  const textures = isObject(model.textures) ? model.textures : {};
  if (typeof textures.layer0 === "string") return { texture: bare(textures.layer0), via: "layer0" };
  const parent = typeof model.parent === "string" ? bare(model.parent) : "";
  if (!parent.startsWith("block/")) return { texture: null, reason: `modelo sem layer0 e sem bloco (parent ${parent || "nenhum"})` };
  const blockBytes = read(`assets/minecraft/models/${parent}.json`);
  const block = blockBytes ? parseLenient(blockBytes) : undefined;
  if (!isObject(block) || !isObject(block.textures)) return { texture: null, reason: `modelo de bloco sem texturas (${parent})` };
  for (const face of BLOCK_FACES) {
    const value = block.textures[face];
    if (typeof value === "string" && !value.startsWith("#")) return { texture: bare(value), via: "blockFace", face, blockModel: parent };
  }
  return { texture: null, reason: `modelo de bloco sem face all/front/side (${parent})` };
}

/** Leitor do jar vanilla (pasta ou zip) restrito a models/ e textures/ do namespace minecraft. */
export function vanillaReader(jarPath: string): ReadVanilla {
  if (statSync(jarPath).isDirectory()) {
    return (rel) => {
      const full = path.join(jarPath, ...rel.split("/"));
      return existsSync(full) ? readFileSync(full) : null;
    };
  }
  const entries = unzipSync(readFileSync(jarPath), {
    filter: (f) => f.name.startsWith("assets/minecraft/models/") || f.name.startsWith("assets/minecraft/textures/"),
  });
  return (rel) => entries[rel] ?? null;
}

export interface VanillaTexturesResult {
  /** caminho do item -> caminho publicado relativo a assets/items ("minecraft/<item>.png") */
  published: Map<string, string>;
  /** item de bloco (3D no jogo) publicado com uma face do bloco */
  blockFace: { item: string; texture: string; face: string }[];
  animated: string[];
  missing: { item: string; reason: string }[];
}

export async function publishVanillaTextures(ctx: PipelineContext, itemPaths: readonly string[]): Promise<VanillaTexturesResult> {
  const result: VanillaTexturesResult = { published: new Map(), blockFace: [], animated: [], missing: [] };
  if (ctx.flags.skipMedia || itemPaths.length === 0) return result;
  const jar = vanillaJarPath(ctx.reader.root, ctx.reader.mode);
  if (!existsSync(jar)) {
    ctx.report.warn("W_VANILLA_TEXTURES_MISSING", "jar vanilla nao encontrado: itens minecraft ficam sem textura", { path: jar });
    return result;
  }
  const read = vanillaReader(jar);
  for (const item of [...new Set(itemPaths)].sort()) {
    const choice = chooseVanillaTexture(read, item);
    if (choice.texture === null) {
      result.missing.push({ item, reason: choice.reason });
      continue;
    }
    const rel = `assets/minecraft/textures/${choice.texture}.png`;
    const png = read(rel);
    if (!png || png.byteLength === 0) {
      result.missing.push({ item, reason: `textura ausente no jar (${rel})` });
      continue;
    }
    const mcmeta = read(`${rel}.mcmeta`);
    const animation = mcmeta ? parseTextureAnimation(mcmeta, `vanilla!${rel}.mcmeta`) : null;
    const out = animation ? await extractAnimationFrame(png, animation, `vanilla!${rel}`) : png;
    if (animation) result.animated.push(item);
    if (choice.via === "blockFace") result.blockFace.push({ item, texture: choice.texture, face: choice.face });
    writeFileAtomic(ctx.assetPath("items", "minecraft", `${item}.png`), out);
    result.published.set(item, `minecraft/${item}.png`);
  }
  if (result.missing.length > 0) {
    ctx.report.warn(
      "W_VANILLA_TEXTURE_UNRESOLVED",
      `${result.missing.length} item(ns) minecraft sem textura: ${result.missing.map((m) => m.item).join(", ")}`,
      result.missing,
    );
  }
  return result;
}

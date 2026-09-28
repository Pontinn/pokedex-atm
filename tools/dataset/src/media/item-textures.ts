// B3.4 passo 3: assets/<ns>/textures/item/**/*.png dos 3 jars com texturas de item (cobblemon,
// allthemons, mega_showdown) -> assets/items/<ns>/<caminho relativo>.png (estrutura de subpastas
// preservada, entao nao ha colisao de nome ao copiar). texture-manifest.json mapeia "<ns>:<basename
// sem extensao>" -> caminho relativo publicado, para o catalogo de itens (B4.1, Onda 2) resolver a
// textura de cada item por id; quando o mesmo basename existe em mais de um caminho no namespace
// (ex. poke_balls/<nome>.png e poke_balls/models/<nome>.png), a versao FORA de "models/" vence.
// Textura com <nome>.png.mcmeta "animation" (tira de quadros) e publicada so com o primeiro quadro (animated-texture.ts).
import type { JarId } from "../source-reader";
import type { PipelineContext } from "../context";
import { writeFileAtomic } from "../lib/fs-atomic";
import { writeJsonAtomic } from "../lib/fs-atomic";
import { extractAnimationFrame, parseTextureAnimation } from "./animated-texture";

const NAMESPACE_JARS: { ns: string; jarId: JarId }[] = [
  { ns: "cobblemon", jarId: "cobblemon" },
  { ns: "allthemons", jarId: "allthemons" },
  { ns: "mega_showdown", jarId: "mega_showdown" },
  // drops legendarymonuments:*_shard vindos das species_additions do legendarymonuments (auditoria A1)
  { ns: "legendarymonuments", jarId: "legendarymonuments" },
];

export interface ItemTexturesResult {
  files: number;
  bytes: number;
  manifest: Record<string, string>;
  /** "<ns>:<caminho relativo sem .png>" das texturas animadas publicadas so com um quadro */
  animated: string[];
}

function basenameNoExt(relPath: string): string {
  const base = relPath.slice(relPath.lastIndexOf("/") + 1);
  return base.replace(/\.png$/, "");
}

function isModelsPath(relPath: string): boolean {
  return relPath.includes("/models/") || relPath.startsWith("models/");
}

export async function extractItemTextures(ctx: PipelineContext): Promise<ItemTexturesResult> {
  const manifest: Record<string, string> = {};
  const animated: string[] = [];
  let files = 0;
  let bytes = 0;

  for (const { ns, jarId } of NAMESPACE_JARS) {
    const jar = ctx.reader.jar(jarId);
    const prefix = `assets/${ns}/textures/item/`;
    const entries = ctx.reader.readJar(jar, [prefix]);
    const pngEntries = [...entries.entries()].filter(([p]) => p.startsWith(prefix) && p.endsWith(".png"));

    // resolve o vencedor por basename (para o manifesto de ids): fora de models/ vence.
    const chosenRel = new Map<string, string>();
    for (const [entryPath] of pngEntries) {
      const rel = entryPath.slice(prefix.length);
      const base = basenameNoExt(rel);
      const current = chosenRel.get(base);
      if (current === undefined || (isModelsPath(current) && !isModelsPath(rel))) chosenRel.set(base, rel);
    }
    for (const [base, rel] of chosenRel) manifest[`${ns}:${base}`] = `${ns}/${rel}`;

    // copia TODOS os arquivos preservando a subpasta (o manifesto acima so resolve ambiguidade de id).
    for (const [entryPath, data] of pngEntries) {
      if (data.byteLength === 0) throw new Error(`E_MEDIA_CORRUPT: ${jar.fileName}!${entryPath} tem 0 bytes`);
      const rel = entryPath.slice(prefix.length);
      const mcmeta = entries.get(`${entryPath}.mcmeta`);
      const where = `${jar.fileName}!${entryPath}`;
      const animation = mcmeta ? parseTextureAnimation(mcmeta, `${where}.mcmeta`) : null;
      const out = animation ? await extractAnimationFrame(data, animation, where) : data;
      if (animation) animated.push(`${ns}:${rel.replace(/.png$/, "")}`);
      bytes += writeFileAtomic(ctx.assetPath("items", ns, rel), out);
      files++;
    }
  }

  writeJsonAtomic(ctx.dataPath("texture-manifest.json"), manifest);
  return { files, bytes, manifest, animated: animated.sort() };
}

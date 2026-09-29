// spawn-bait B1.5: textura de itens de isca de mods fora de NAMESPACE_JARS (hoje so allthemodium), tirada do jar do mod
// (snapshot `mods/<jar>/`, instancia `mods/<jar>.jar`). Regra igual ao item plano vanilla: modelo
// `assets/<ns>/models/item/<path>.json` -> `textures.layer0` (`<ns>:item/<x>`) -> PNG `assets/<ns>/textures/<x>.png`.
// Restrito aos itens de isca para nao mudar a textura de outros itens (o snapshot nao tem as texturas dos outros mods).
// Publicado em `assets/items/<ns>/<path>.png`. Textura com `.png.mcmeta` de animacao publica so o primeiro quadro.
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { unzipSync } from "fflate";
import type { PipelineContext } from "../context";
import { writeFileAtomic } from "../lib/fs-atomic";
import { modJarPaths, parseLenient } from "../items/recipes";
import { extractAnimationFrame, parseTextureAnimation } from "./animated-texture";

/** namespace -> prefixo do nome do arquivo do jar do mod em mods/ */
export const MOD_TEXTURE_JAR_PREFIX: Readonly<Record<string, string>> = { allthemodium: "allthemodium-" };

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
type ReadMod = (rel: string) => Uint8Array | null;

/** Leitor do jar do mod (pasta ou zip) restrito a models/item/ e textures/item/ do namespace. */
function modReader(jarPath: string, ns: string): ReadMod {
  const prefixes = [`assets/${ns}/models/item/`, `assets/${ns}/textures/item/`];
  if (statSync(jarPath).isDirectory()) {
    return (rel) => {
      if (!prefixes.some((p) => rel.startsWith(p))) return null;
      const full = path.join(jarPath, ...rel.split("/"));
      return existsSync(full) ? readFileSync(full) : null;
    };
  }
  const entries = unzipSync(readFileSync(jarPath), { filter: (f) => prefixes.some((p) => f.name.startsWith(p)) });
  return (rel) => entries[rel] ?? null;
}

export interface ModItemTexturesResult {
  /** id do item -> caminho publicado relativo a assets/items ("<ns>/<path>.png") */
  published: Map<string, string>;
  missing: { id: string; reason: string }[];
}

export async function publishModItemTextures(
  ctx: PipelineContext,
  refs: readonly { namespace: string; path: string }[],
): Promise<ModItemTexturesResult> {
  const result: ModItemTexturesResult = { published: new Map(), missing: [] };
  if (ctx.flags.skipMedia || refs.length === 0) return result;
  const jars = modJarPaths(ctx.reader.root);
  const readers = new Map<string, ReadMod | string>();
  const readerFor = (ns: string): ReadMod | string => {
    const cached = readers.get(ns);
    if (cached !== undefined) return cached;
    const prefix = MOD_TEXTURE_JAR_PREFIX[ns];
    const matches = prefix ? jars.filter((j) => j.fileName.startsWith(prefix)) : [];
    const reader = matches.length === 1 ? modReader((matches[0] as { path: string }).path, ns) : `${matches.length} jar(s) em mods/ com o prefixo ${prefix ?? "(nenhum)"}`;
    readers.set(ns, reader);
    return reader;
  };
  const sorted = [...new Map(refs.map((r) => [`${r.namespace}:${r.path}`, r])).values()].sort((a, b) =>
    `${a.namespace}:${a.path}` < `${b.namespace}:${b.path}` ? -1 : 1,
  );
  for (const { namespace: ns, path: itemPath } of sorted) {
    const id = `${ns}:${itemPath}`;
    const read = readerFor(ns);
    if (typeof read === "string") {
      result.missing.push({ id, reason: read });
      continue;
    }
    const modelBytes = read(`assets/${ns}/models/item/${itemPath}.json`);
    const model = modelBytes ? parseLenient(modelBytes) : undefined;
    if (!isObject(model)) {
      result.missing.push({ id, reason: modelBytes ? "modelo de item invalido" : "sem modelo de item" });
      continue;
    }
    const layer0 = isObject(model.textures) && typeof model.textures.layer0 === "string" ? model.textures.layer0 : null;
    const m = layer0 ? /^(?:([a-z0-9_.-]+):)?(item\/.+)$/.exec(layer0) : null;
    if (!m || (m[1] ?? "minecraft") !== ns) {
      result.missing.push({ id, reason: `modelo sem layer0 item/ do namespace (${layer0 ?? "nenhum"})` });
      continue;
    }
    const rel = `assets/${ns}/textures/${m[2]}.png`;
    const png = read(rel);
    if (!png || png.byteLength === 0) {
      result.missing.push({ id, reason: `textura ausente no jar (${rel})` });
      continue;
    }
    const mcmeta = read(`${rel}.mcmeta`);
    const animation = mcmeta ? parseTextureAnimation(mcmeta, `${ns}!${rel}.mcmeta`) : null;
    const frame = animation ? await extractAnimationFrame(png, animation, `${ns}!${rel}`) : png;
    writeFileAtomic(ctx.assetPath("items", ns, `${itemPath}.png`), frame);
    result.published.set(id, `${ns}/${itemPath}.png`);
  }
  if (result.missing.length > 0) {
    ctx.report.warn(
      "W_MOD_TEXTURE_UNRESOLVED",
      `${result.missing.length} item(ns) de isca de mod sem textura: ${result.missing.map((m) => m.id).join(", ")}`,
      result.missing,
    );
  }
  return result;
}

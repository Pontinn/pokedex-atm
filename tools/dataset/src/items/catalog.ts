// B4.1 passo 1: catalogo de ids de item. Fontes: chaves item.<ns>.<path> do lang (cobblemon,
// allthemons, mega_showdown), com textura OU tooltip; mais qualquer id referenciado por drops,
// evolutions.requiredItem, forms.requiredItems, fossils, signatureItem/bag/heldItem dos treinadores
// (entram como "referenciados": nome humanizado do path quando sem lang, category "other", texture null).
import { existsSync, readFileSync } from "node:fs";
import type { LocalizedText, SeriesInfo, TrainersFile } from "../../../../src/data/types";
import type { DerivedSpecies } from "../species/stage-derive";
import type { LangTable, PipelineContext } from "../context";
import { createGameDescriptionResolver } from "./descriptions";

export interface CatalogEntry {
  id: string;
  namespace: string;
  path: string;
  name: LocalizedText;
  description: LocalizedText | null;
  texture: string | null;
  /** false = id so existe por causa de uma referencia (drop/evolucao/forma/fossil/treinador), sem lang proprio */
  fromLang: boolean;
  /** U7d: id que so entrou por referencia (drop/evolucao/forma/fossil/treinador), nao pelo lang (nome + textura ou tooltip) */
  referenceOnly: boolean;
  /** spawn-bait: entrou so pela fonte de referencia de isca (spawn_bait_effects ou saida de receita de isca da panela) */
  viaBait: boolean;
}

const LANG_ITEM_NAMESPACES = ["cobblemon", "allthemons", "mega_showdown"] as const;
const ITEM_KEY = /^item\.(cobblemon|allthemons|mega_showdown)\.(.+)$/;

export function humanizeItemPath(pathPart: string): LocalizedText {
  const text = pathPart
    .split(/[_/]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { pt: text, en: text };
}

/** ids com nome ou tooltip no lang, chave = "<ns>:<path>" (SPEC B4.1 passo 1). */
function collectLangItemIds(lang: LangTable): Map<string, { namespace: string; path: string }> {
  const out = new Map<string, { namespace: string; path: string }>();
  const scan = (map: ReadonlyMap<string, string>) => {
    for (const key of map.keys()) {
      const match = ITEM_KEY.exec(key);
      if (!match) continue;
      const namespace = match[1] as string;
      const restPath = match[2] as string;
      // U7d: chave com sufixo (`.tooltip`, `.desc`...) nao cria id; so a chave do nome (ex. `item.allthemons.badge.tooltip` nao e item)
      if (restPath.includes(".")) continue;
      out.set(`${namespace}:${restPath}`, { namespace, path: restPath });
    }
  };
  for (const ns of LANG_ITEM_NAMESPACES) void ns; // namespaces documentados acima; o regex ja restringe a eles
  scan(lang.pt);
  scan(lang.en);
  return out;
}

function readJsonIfExists<T>(file: string): T | null {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

/** ids referenciados por drops/evolucoes/formas das especies (ja em memoria, DerivedSpecies). */
function collectSpeciesReferencedIds(ctx: PipelineContext): Set<string> {
  const ids = new Set<string>();
  for (const merged of ctx.species.values()) {
    const species = merged as DerivedSpecies;
    for (const drop of species.drops) ids.add(drop.item);
    for (const edge of species.evolutions ?? []) if (edge.requiredItem) ids.add(edge.requiredItem);
    for (const form of species.resolvedForms ?? []) for (const item of form.requiredItems) ids.add(item);
  }
  return ids;
}

/** ids referenciados por fossils.json (result.fossils[]). */
export function collectFossilReferencedIds(fossils: readonly { fossils: readonly string[] }[]): Set<string> {
  const ids = new Set<string>();
  for (const route of fossils) for (const item of route.fossils) ids.add(item);
  return ids;
}

/** ids referenciados por signatureItem/bag/heldItems dos treinadores ja escritos no staging (etapa trainers, antes de items). */
function collectTrainerReferencedIds(ctx: PipelineContext): Set<string> {
  const ids = new Set<string>();
  const series = readJsonIfExists<SeriesInfo[]>(ctx.dataPath("series.json"));
  if (!series) return ids;
  for (const s of series) {
    const file = readJsonIfExists<TrainersFile>(ctx.dataPath(s.trainersFile));
    if (!file) continue;
    for (const trainer of file.trainers) {
      if (trainer.signatureItem) ids.add(trainer.signatureItem);
      for (const bagEntry of trainer.bag) ids.add(bagEntry.item);
      for (const member of trainer.team) for (const item of member.heldItems) ids.add(item);
    }
  }
  return ids;
}

export interface BuildCatalogDeps {
  lang: LangTable;
  textureManifest: ReadonlyMap<string, string>;
  fossilItemIds: ReadonlySet<string>;
  /** U8: nome do jogo para item sem chave no ctx.lang (lang dos outros jars + vanilla; ex. `minecraft:*`) */
  gameItemName?: (id: string) => LocalizedText | null;
  /** spawn-bait: ids de spawn_bait_effects (jar + kubejs) uniao saidas das receitas de isca da panela */
  baitItemIds?: ReadonlySet<string>;
}

/** Catalogo final: ids do lang (com textura OU tooltip) uniao ids referenciados (SPEC B4.1 passo 1). */
export function buildCatalog(ctx: PipelineContext, deps: BuildCatalogDeps): CatalogEntry[] {
  const langIds = collectLangItemIds(deps.lang);
  const referenced = new Set<string>([
    ...collectSpeciesReferencedIds(ctx),
    ...deps.fossilItemIds,
    ...collectTrainerReferencedIds(ctx),
  ]);

  const allIds = new Set<string>();
  for (const [id, entry] of langIds) {
    const hasTexture = deps.textureManifest.has(`${entry.namespace}:${entry.path.split("/").pop()}`) || deps.textureManifest.has(id);
    const hasTooltip = deps.lang.has(`item.${entry.namespace}.${entry.path}.tooltip`);
    if (hasTexture || hasTooltip) allIds.add(id);
  }
  const fromLangKeys = new Set(allIds);
  for (const id of referenced) allIds.add(id);
  // spawn-bait: iscas que nenhuma outra fonte traria entram como referenceOnly (regra do fantasma continua valendo)
  const baitOnly = new Set([...(deps.baitItemIds ?? [])].filter((id) => !allIds.has(id)));
  for (const id of baitOnly) allIds.add(id);

  const gameDescription = createGameDescriptionResolver(deps.lang);
  const catalog: CatalogEntry[] = [];
  for (const id of allIds) {
    const [namespace, ...rest] = id.split(":");
    const itemPath = rest.join(":");
    const ns = namespace ?? "unknown";
    const nameKey = `item.${ns}.${itemPath}`;
    const langName = deps.lang.text(nameKey);
    // nome so em pt (ex. kubejs traz so pt_br para itens do allthemodium): EN fica com o path humanizado, nunca o texto PT
    // U8: o en vem do lang en_us do jar do mod quando existe (ex. allthemodium), senao do path humanizado
    const ownName =
      langName && !deps.lang.en.has(nameKey) ? { pt: langName.pt, en: deps.gameItemName?.(id)?.en ?? humanizeItemPath(itemPath).en } : langName;
    // U8: sem chave no lang do app, nome do jogo (outros jars / vanilla; en obrigatorio, pt cai para en)
    const gameName = ownName ? null : (deps.gameItemName?.(id) ?? null);
    const name = ownName ?? gameName;
    const description = gameDescription(ns, itemPath);
    const texture = deps.textureManifest.get(`${ns}:${itemPath.split("/").pop()}`) ?? deps.textureManifest.get(id) ?? null;
    catalog.push({
      id,
      namespace: ns,
      path: itemPath,
      name: name ?? humanizeItemPath(itemPath),
      description,
      texture: texture ? `assets/items/${texture}` : null,
      fromLang: ownName !== null,
      referenceOnly: !fromLangKeys.has(id),
      viaBait: baitOnly.has(id),
    });
  }
  return catalog.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

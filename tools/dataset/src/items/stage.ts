// B4.1 (catalogo) + B4.2 (rotas de obtencao e "Usado em"). Nunca escreve em public/ (so ctx.outDir).
import { existsSync, readFileSync } from "node:fs";
import type { BallsFile, FossilRoute, ItemInfo, ItemObtainRoute, ItemTag, SeriesInfo, TrainersFile } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";
import { writeJsonAtomic } from "../lib/fs-atomic";
import { collectFossils, resolveFossils } from "../species/fossils";
import { buildCatalog, collectFossilReferencedIds } from "./catalog";
import { categorize } from "./categories";
import { applyCuratedDescriptions, loadCuratedDescriptions } from "./descriptions";
import { collectBerryPlantable } from "./berries";
import { collectCraftable } from "./recipes";
import { buildDropsIndex } from "./drops-index";
import { collectLoot } from "./loot";
import { buildUsedInIndex } from "./used-in";
import { buildTrainerDrops, collectRctLootTables, type TrainerRef } from "./trainer-drops";
import { versionStagedAsset } from "../media/asset-version";

const BAIT_PREFIX = "data/cobblemon/spawn_bait_effects/";
type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** Todo item referenciado em spawn_bait_effects/**.json (berries/, fruits/ e o proprio poke_bait.json) ganha tag "bait". */
function collectBaitItemIds(ctx: Pick<PipelineContext, "reader">): Set<string> {
  const ids = new Set<string>();
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [BAIT_PREFIX]);
    for (const { data } of readJsonEntries<Json>(entries, BAIT_PREFIX, jar.fileName)) {
      if (isObject(data) && typeof data.item === "string") ids.add(data.item);
    }
  }
  return ids;
}

function readJsonIfExists<T>(file: string): T | null {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

/** id do treinador -> nome + serie, dos trainers/*.json ja escritos no staging (etapa trainers roda antes). */
function collectTrainerRefs(ctx: PipelineContext): Map<string, TrainerRef> {
  const refs = new Map<string, TrainerRef>();
  for (const s of readJsonIfExists<SeriesInfo[]>(ctx.dataPath("series.json")) ?? []) {
    const file = readJsonIfExists<TrainersFile>(ctx.dataPath(s.trainersFile));
    for (const trainer of file?.trainers ?? []) if (!refs.has(trainer.id)) refs.set(trainer.id, { name: trainer.name, series: s.id });
  }
  return refs;
}

export async function runItemsStage(ctx: PipelineContext): Promise<void> {
  const textureManifest = new Map(Object.entries(readJsonIfExists<Record<string, string>>(ctx.dataPath("texture-manifest.json")) ?? {}));

  const slugToDex = new Map<string, number>();
  for (const ms of ctx.species.values()) slugToDex.set(ms.slug, ms.dex);
  const fossils: FossilRoute[] = resolveFossils(collectFossils(ctx), slugToDex, ctx.report);
  const fossilItemIds = collectFossilReferencedIds(fossils);

  // descricao curada so para itens sem texto no jogo (o jogo vence); ids curados fora do catalogo sao ignorados
  const curated = applyCuratedDescriptions(buildCatalog(ctx, { lang: ctx.lang, textureManifest, fossilItemIds }), loadCuratedDescriptions());
  const catalog = curated.entries;
  if (curated.unknownIds.length > 0) {
    ctx.report.warn(
      "W_CURATED_ITEM_UNKNOWN",
      `${curated.unknownIds.length} id(s) em curated/item-descriptions.json fora do catalogo (ignorados): ${curated.unknownIds.join(", ")}`,
      curated.unknownIds,
    );
  }

  const baitIds = collectBaitItemIds(ctx);
  const craftable = collectCraftable(ctx, new Set(catalog.map((e) => e.id)));
  const dropsIndex = buildDropsIndex(ctx);
  const berryPlantable = collectBerryPlantable(ctx);
  const loot = collectLoot(ctx, new Set(catalog.map((e) => e.id)));
  const balls = readJsonIfExists<BallsFile>(ctx.dataPath("balls.json")) ?? [];
  const usedInIndex = buildUsedInIndex(ctx, fossils, balls);
  const trainerDrops = buildTrainerDrops(collectRctLootTables(ctx), collectTrainerRefs(ctx));

  const items: Record<string, ItemInfo> = {};
  const unversionedTextures: string[] = [];
  for (const entry of catalog) {
    const { category, tags: baseTags } = categorize(entry.path, entry.texture);
    const tags = new Set<ItemTag>(baseTags);
    if (baitIds.has(entry.id)) tags.add("bait");

    const obtain: ItemObtainRoute[] = [];
    const recipeTypes = craftable.get(entry.id);
    if (recipeTypes) obtain.push({ kind: "craftable", recipeTypes: [...recipeTypes].sort() });
    const drops = dropsIndex.get(entry.id);
    if (drops && drops.length > 0) obtain.push({ kind: "drop", from: drops });
    const plantable = berryPlantable.get(entry.id);
    if (plantable) {
      obtain.push({ kind: "plantable", biomeTags: plantable.biomeTags, mulches: plantable.mulches });
    } else if (category === "mint" || tags.has("apricorn")) {
      // apricorns e mints: plantable sem bioma preferido conhecido (SPEC 5.1.6 [ASSUMPTION]).
      obtain.push({ kind: "plantable", biomeTags: [], mulches: [] });
    }
    const structureTables = loot.structureLoot.get(entry.id);
    if (structureTables && structureTables.size > 0) obtain.push({ kind: "structureLoot", tables: [...structureTables].sort() });
    if (loot.fishing.has(entry.id)) obtain.push({ kind: "fishing" });
    const fossilRevive = fossils.filter((f) => f.fossils.includes(entry.id)).map((f) => f.result);
    if (fossilRevive.length > 0) obtain.push({ kind: "fossilRevive", species: fossilRevive });
    const droppedBy = trainerDrops.get(entry.id);
    if (droppedBy && droppedBy.length > 0) obtain.push({ kind: "trainerDrop", trainers: droppedBy });
    if (obtain.length === 0) obtain.push({ kind: "none" });

    // U3: textura publicada com ?v=<sha8 dos bytes> (cache busting); categorize acima usa o caminho sem query
    let texture = entry.texture;
    if (texture) {
      const versioned = versionStagedAsset(ctx.outDir, texture);
      if (versioned.missing) unversionedTextures.push(entry.id);
      texture = versioned.path;
    }

    items[entry.id] = {
      id: entry.id,
      namespace: entry.namespace,
      path: entry.path,
      name: entry.name,
      description: entry.description,
      category,
      texture,
      tags: [...tags],
      obtain,
      usedIn: usedInIndex.get(entry.id) ?? { evolutions: [], fossils: [], forms: [], ball: false },
      cooking: category === "cooking" ? { effectNote: "pending" } : null,
    } satisfies ItemInfo;
  }

  if (unversionedTextures.length > 0) {
    ctx.report.warn(
      "W_ASSET_UNVERSIONED",
      `${unversionedTextures.length} textura(s) sem arquivo no staging (publicadas sem ?v=): ${unversionedTextures.slice(0, 10).join(", ")}`,
      unversionedTextures,
    );
  }

  writeJsonAtomic(ctx.dataPath("items.json"), items);
  ctx.setCount("items", Object.keys(items).length);
  const withoutDescription = catalog.filter((e) => e.description === null).length;
  const withTrainerDrop = Object.values(items).filter((it) => it.obtain.some((r) => r.kind === "trainerDrop")).length;
  ctx.report.section("items", {
    count: Object.keys(items).length,
    trainerDrop: { items: withTrainerDrop, lootItemsOutsideCatalog: [...trainerDrops.keys()].filter((id) => !(id in items)).sort() },
    descriptions: {
      fromGame: catalog.length - curated.fromCurated.length - withoutDescription,
      fromCurated: curated.fromCurated.length,
      none: withoutDescription,
      curatedShadowedByGame: curated.shadowedByGame,
      curatedUnknownIds: curated.unknownIds,
    },
  });
}

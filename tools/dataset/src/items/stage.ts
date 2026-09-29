// B4.1 (catalogo) + B4.2 (rotas de obtencao e "Usado em"). Nunca escreve em public/ (so ctx.outDir).
import { existsSync, readFileSync } from "node:fs";
import type { BallsFile, FossilRoute, ItemBait, ItemCategory, ItemInfo, ItemNamedRef, ItemObtainRoute, ItemTag, PotRecipe, SeriesInfo, TrainersFile } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { writeJsonAtomic } from "../lib/fs-atomic";
import { collectFossils, resolveFossils } from "../species/fossils";
import { buildCatalog, collectFossilReferencedIds } from "./catalog";
import { categorize } from "./categories";
import { applyCuratedDescriptions, loadCuratedDescriptions } from "./descriptions";
import { collectBerryPlantable } from "./berries";
import { gatherRecipes, reportRecipes, type PotRecipeRecord } from "./recipes";
import { buildDropsIndex } from "./drops-index";
import { collectLoot } from "./loot";
import { buildUsedInIndex } from "./used-in";
import { buildTrainerDrops, collectRctLootTables, type TrainerRef } from "./trainer-drops";
import { versionStagedAsset } from "../media/asset-version";
import { collectExtraSources, structureRefs } from "./extra-sources";
import path from "node:path";
import { createNameResolver, itemName, loadNameLang, refLangKey, type NameResolver } from "./ref-names";
import { publishVanillaTextures } from "../media/vanilla-textures";
import { baitTypePath, buildSeasoningSet, collectBaitEffects, loadSeasoningExtra, normalizeBaitEffects, renderBaitTooltip } from "./bait";

/** U7d: ids comprovadamente nao registrados no jogo (id -> prova), curados de RESEARCH_obtain e conferidos nos registros do jar. */
export const NOT_REGISTERED_FILE = path.resolve(import.meta.dirname, "../../curated/item-not-registered.json");

/** {id, name} com o nome do lang do jogo (`<prefixo>.<ns>.<caminho com .>`); sem chave en = null (nunca inventado).
 * U8: `resolve` le ctx.lang (com kubejs por cima) e depois o lang de todos os jars + vanilla (ref-names.ts). */
export function namedRefs(ids: Iterable<string>, prefix: "block" | "entity" | "structure", resolve: NameResolver): ItemNamedRef[] {
  // en obrigatorio (pt cai para en quando o jogo nao tem pt; nunca o contrario: en com texto em portugues)
  return [...new Set(ids)].sort().map((id) => ({ id, name: resolve(refLangKey(prefix, id)) }));
}

/** U8: por tipo de ref, ids unicos com e sem nome (para o report). */
export function refNameCounts(items: Record<string, ItemInfo>): Record<"block" | "mob" | "structure", { named: number; unnamed: string[] }> {
  const acc = { block: new Map<string, boolean>(), mob: new Map<string, boolean>(), structure: new Map<string, boolean>() };
  for (const it of Object.values(items)) {
    for (const r of it.obtain) {
      const list = r.kind === "blockDrop" ? r.blocks : r.kind === "mobDrop" ? r.mobs : r.kind === "structurePlaced" ? r.structures : null;
      const target = r.kind === "blockDrop" ? acc.block : r.kind === "mobDrop" ? acc.mob : acc.structure;
      for (const ref of list ?? []) target.set(ref.id, ref.name !== null);
    }
  }
  const summary = (m: Map<string, boolean>) => ({ named: [...m.values()].filter(Boolean).length, unnamed: [...m].filter(([, v]) => !v).map(([k]) => k).sort() });
  return { block: summary(acc.block), mob: summary(acc.mob), structure: summary(acc.structure) };
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
  // U8: nomes do jogo fora do lang do app (blocos, mobs, estruturas, itens minecraft)
  const resolveName = createNameResolver(ctx.lang, loadNameLang(ctx));
  const gameItemName = (id: string) => itemName(resolveName, id);
  // spawn-bait: receitas lidas UMA vez antes do catalogo (saidas das receitas de isca da panela entram no catalogo)
  const recipeData = gatherRecipes(ctx);
  // todo item com arquivo em spawn_bait_effects (jars + kubejs, kubejs vence) ganha tag "bait" e ItemInfo.bait
  const baitEffects = collectBaitEffects(ctx);
  const potOutputs = new Set(recipeData.potRecipes.keys());
  const baitItemIds = new Set([...baitEffects.keys(), ...potOutputs]);
  const built = buildCatalog(ctx, { lang: ctx.lang, textureManifest, fossilItemIds, gameItemName, baitItemIds });
  // U8: itens minecraft sem textura do app ganham a do jar vanilla (modelo do item), publicada em assets/items/minecraft/
  const vanillaTextures = await publishVanillaTextures(ctx, built.filter((e) => e.namespace === "minecraft" && e.texture === null).map((e) => e.path));
  for (const entry of built) {
    const rel = entry.namespace === "minecraft" && entry.texture === null ? vanillaTextures.published.get(entry.path) : undefined;
    if (rel) entry.texture = `assets/items/${rel}`;
  }
  const curated = applyCuratedDescriptions(built, loadCuratedDescriptions());
  const catalog = curated.entries;
  if (curated.unknownIds.length > 0) {
    ctx.report.warn(
      "W_CURATED_ITEM_UNKNOWN",
      `${curated.unknownIds.length} id(s) em curated/item-descriptions.json fora do catalogo (ignorados): ${curated.unknownIds.join(", ")}`,
      curated.unknownIds,
    );
  }

  reportRecipes(ctx, recipeData, new Set(catalog.map((e) => e.id)));
  const craftable = recipeData.craftable;
  const seasoningExtra = loadSeasoningExtra();
  const seasoning = buildSeasoningSet(recipeData.itemTags, seasoningExtra);
  const extraWithoutEffect = [...seasoningExtra.keys()].filter((id) => !baitEffects.has(id)).sort();
  if (extraWithoutEffect.length > 0) {
    ctx.report.warn("W_BAIT_SEASONING_EXTRA_UNKNOWN", `${extraWithoutEffect.length} id(s) em curated/bait-seasoning-extra.json sem efeito de isca: ${extraWithoutEffect.join(", ")}`, extraWithoutEffect);
  }
  const dropsIndex = buildDropsIndex(ctx);
  const berryPlantable = collectBerryPlantable(ctx);
  const loot = collectLoot(ctx, new Set(catalog.map((e) => e.id)));
  const balls = readJsonIfExists<BallsFile>(ctx.dataPath("balls.json")) ?? [];
  const usedInIndex = buildUsedInIndex(ctx, fossils, balls);
  const trainerDrops = buildTrainerDrops(collectRctLootTables(ctx), collectTrainerRefs(ctx));
  const speciesBySlug = new Map([...ctx.species.values()].map((ms) => [ms.slug, ms.name]));
  const extra = collectExtraSources(ctx, (slug) => speciesBySlug.get(slug) ?? null, gameItemName);

  const notRegistered = new Map(Object.entries(readJsonIfExists<Record<string, string>>(NOT_REGISTERED_FILE) ?? {}));
  const phantomIds: string[] = [];
  const unobtainable: Record<"creativeOnly" | "notRegistered", string[]> = { creativeOnly: [], notRegistered: [] };
  const items: Record<string, ItemInfo> = {};
  const unversionedTextures: string[] = [];
  const toPublished = (r: PotRecipeRecord): PotRecipe => ({
    recipeId: r.recipeId,
    recipeType: r.recipeType,
    seasoningTag: r.seasoningTag,
    ingredients: r.ingredients.map((i) => (i.kind === "item" ? { kind: "item", id: i.id, count: i.count, name: gameItemName(i.id) } : { kind: "tag", id: i.id, count: i.count })),
  });
  const baitOf = (id: string): ItemBait | null => {
    const raw = baitEffects.get(id);
    if (!raw) return null;
    const effects = normalizeBaitEffects(raw, ctx.report, id).map((e) => ({ ...e, text: renderBaitTooltip(e, baitTypePath(e.kind), ctx.lang, ctx.report) }));
    return { effects, seasoning: seasoning.has(id) };
  };
  for (const entry of catalog) {
    const { category: baseCategory, tags: baseTags } = categorize(entry.path, entry.texture);
    // spawn-bait: categoria "bait" = entrou so pela fonte de isca OU e saida de receita de isca da panela (9 itens hoje)
    const category: ItemCategory = entry.viaBait || potOutputs.has(entry.id) ? "bait" : baseCategory;
    const tags = new Set<ItemTag>(baseTags);
    if (baitEffects.has(entry.id) || potOutputs.has(entry.id)) tags.add("bait");

    const obtain: ItemObtainRoute[] = [];
    const recipeTypes = craftable.get(entry.id);
    const pots = recipeData.potRecipes.get(entry.id);
    if (recipeTypes) obtain.push({ kind: "craftable", recipeTypes: [...recipeTypes].sort(), ...(pots && pots.length ? { potRecipes: pots.map(toPublished) } : {}) });
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
    const blocks = loot.blockDrop.get(entry.id);
    if (blocks && blocks.size > 0) obtain.push({ kind: "blockDrop", blocks: namedRefs(blocks, "block", resolveName) });
    const mobs = loot.mobDrop.get(entry.id);
    if (mobs && mobs.size > 0) obtain.push({ kind: "mobDrop", mobs: namedRefs(mobs, "entity", resolveName) });
    const fossilRevive = fossils.filter((f) => f.fossils.includes(entry.id)).map((f) => f.result);
    if (fossilRevive.length > 0) obtain.push({ kind: "fossilRevive", species: fossilRevive });
    const droppedBy = trainerDrops.get(entry.id);
    if (droppedBy && droppedBy.length > 0) obtain.push({ kind: "trainerDrop", trainers: droppedBy });
    // U7c: fontes fora de receita/loot (extra-sources.ts), sempre com prova num arquivo do pack
    const quests = extra.quests.get(entry.id);
    if (quests && quests.length > 0) obtain.push({ kind: "questReward", quests });
    if (extra.shop.has(entry.id)) obtain.push({ kind: "shop", shop: "battleTowerBp", price: extra.shop.get(entry.id) ?? null });
    const placedIn = extra.structures.get(entry.id);
    if (placedIn && placedIn.length > 0) obtain.push({ kind: "structurePlaced", structures: structureRefs(placedIn, (id) => resolveName(refLangKey("structure", id))) });
    const rituals = extra.rituals.get(entry.id);
    if (rituals && rituals.length > 0) obtain.push({ kind: "ritual", rituals: [...rituals].sort() });
    if (extra.trades.has(entry.id)) obtain.push({ kind: "trade", traders: ["wanderingTrader"] });
    const features = loot.blockSelfDrops.has(entry.id) ? extra.worldgenBlocks.get(entry.id) : undefined;
    if (features && features.length > 0) obtain.push({ kind: "worldgen", features: [...features].sort() });
    for (const sp of extra.special.get(entry.id) ?? []) obtain.push({ kind: "special", note: sp.note, evidence: sp.evidence });
    if (obtain.length === 0) {
      // U7d: id so referenciado (treinador, evolucao, forma...), sem textura e sem nenhuma rota no pack = nao e item
      // registrado: typo (mega_showdown:darkinium-z), especie usada como parceiro de troca (karrablast) ou chave de lang
      // sem item (mega_showdown:baxcalibrite: so o lang do jar, sem modelo nem classe; o item real e zamega:baxcalibrite)
      if (entry.referenceOnly && entry.texture === null) {
        phantomIds.push(entry.id);
        continue;
      }
      const reason = notRegistered.has(entry.id) ? "notRegistered" : "creativeOnly";
      unobtainable[reason].push(entry.id);
      obtain.push({ kind: "unobtainable", reason });
    } else if (notRegistered.has(entry.id)) {
      ctx.report.warn("W_NOT_REGISTERED_HAS_ROUTE", `${entry.id} esta em curated/item-not-registered.json mas tem rota no pack`, { id: entry.id });
    }

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
      bait: baitOf(entry.id),
    } satisfies ItemInfo;
  }

  if (unversionedTextures.length > 0) {
    ctx.report.warn(
      "W_ASSET_UNVERSIONED",
      `${unversionedTextures.length} textura(s) sem arquivo no staging (publicadas sem ?v=): ${unversionedTextures.slice(0, 10).join(", ")}`,
      unversionedTextures,
    );
  }

  if (phantomIds.length > 0) {
    ctx.report.warn(
      "W_ITEM_REFERENCE_UNKNOWN",
      `${phantomIds.length} id(s) so referenciados (treinador/evolucao/forma), sem textura nem rota (fora do items.json): ${phantomIds.join(", ")}`,
      phantomIds,
    );
  }

  writeJsonAtomic(ctx.dataPath("items.json"), items);
  const withBait = Object.values(items).filter((it) => it.bait !== null);
  ctx.report.section("bait", {
    items: withBait.length,
    seasoning: withBait.filter((it) => it.bait?.seasoning).length,
    withTyping: withBait.filter((it) => it.bait?.effects.some((e) => e.kind === "typing")).length,
    withEggGroup: withBait.filter((it) => it.bait?.effects.some((e) => e.kind === "eggGroup")).length,
    boosters: withBait.filter((it) => it.bait?.effects.some((e) => e.kind === "rarityBucket" || e.kind === "shinyReroll")).map((it) => it.id).sort(),
  });
  ctx.setCount("items", Object.keys(items).length);
  const withoutDescription = catalog.filter((e) => e.description === null).length;
  const withTrainerDrop = Object.values(items).filter((it) => it.obtain.some((r) => r.kind === "trainerDrop")).length;
  ctx.report.section("items", {
    count: Object.keys(items).length,
    unobtainable,
    phantomIds,
    obtainKinds: Object.fromEntries(
      [...new Set(Object.values(items).flatMap((it) => it.obtain.map((r) => r.kind)))].sort().map((k) => [k, Object.values(items).filter((it) => it.obtain.some((r) => r.kind === k)).length]),
    ),
    // U8: nomes de ref preenchidos pelo lang do jogo (ids unicos por tipo) e texturas vanilla
    refNames: refNameCounts(items),
    // U10: templates .nbt com item que nenhuma estrutura do worldgen gera (gametest, peca de codigo, estrutura desligada)
    structureTemplatesUnreached: extra.structureTemplatesUnreached,
    vanillaTextures: {
      published: vanillaTextures.published.size,
      blockFace: vanillaTextures.blockFace,
      animated: vanillaTextures.animated,
      tinted: vanillaTextures.tinted,
      missing: vanillaTextures.missing,
    },
    trainerDrop: { items: withTrainerDrop, lootItemsOutsideCatalog: [...trainerDrops.keys()].filter((id) => !(id in items)).sort() },
    bait: { newCatalogIds: catalog.filter((e) => e.viaBait && e.id in items).map((e) => e.id) },
    descriptions: {
      fromGame: catalog.length - curated.fromCurated.length - withoutDescription,
      fromCurated: curated.fromCurated.length,
      none: withoutDescription,
      curatedShadowedByGame: curated.shadowedByGame,
      curatedUnknownIds: curated.unknownIds,
    },
  });
}

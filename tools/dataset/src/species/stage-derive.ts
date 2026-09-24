// Dono: Onda 1 - Especies (B2.3, B2.4). index.ts ja chama esta etapa na ordem final.
// Chama spawns -> rarity -> fossils -> obtain e depois B2.4 (evolucoes, cadeia, formas), gravando em ctx.species.
//
// MergedSpecies (contrato congelado de B2.2/context.ts) NAO tem campos para spawns/rarity/obtain/evolutionChain/
// forms resolvidas: como context.ts esta congelado nas Ondas 1 e 1b, os campos derivados sao gravados nos
// PROPRIOS objetos de ctx.species (o Map e seus valores nao sao congelados, so o formato tipado de MergedSpecies).
// `DerivedSpecies` (abaixo) e o tipo de extensao: quem monta species/<dex>.json (B2.5, Onda 2, index-writer.ts)
// deve importar `DerivedSpecies` daqui e fazer `ctx.species.get(dex) as DerivedSpecies` para ler
// spawns/rarity/obtain/evolutions/preEvolution/evolutionChain/resolvedForms (ver HANDOFF_species.md).
import type { EvolutionChain, EvolutionEdge, ObtainRoute, RarityInfo, SpawnEntry, SpeciesForm } from "../../../../src/data/types";
import type { MergedSpecies, PipelineContext } from "../context";
import { buildChain, edgesForSpecies, findChainRoot, findEdge, resolvePreEvolution } from "./evolutions";
import { collectFossils, resolveFossils } from "./fossils";
import { collectMegaItemDefs, resolveForm } from "./forms";
import { deriveSpeciesObtain, type ObtainDeps } from "./obtain";
import { deriveRarity } from "./rarity";
import { collectSpawnsBySlug } from "./spawns";

/** Campos gravados em cada MergedSpecies por esta etapa (B2.3/B2.4). */
export interface SpeciesDerivedFields {
  spawns: SpawnEntry[];
  rarity: RarityInfo;
  obtain: ObtainRoute[];
  /** saidas desta especie (B2.4) */
  evolutions: EvolutionEdge[];
  preEvolution: { dex: number; slug: string } | null;
  evolutionChain: EvolutionChain;
  /** SpeciesForm[] resolvidas (com requiredItems); nome distinto de `forms` (MergedForm[] cru de B2.2)
   *  para nao colidir com o tipo congelado de MergedSpecies.forms. */
  resolvedForms: SpeciesForm[];
}

export type DerivedSpecies = MergedSpecies & SpeciesDerivedFields;

/** Spawns, raridade, fosseis, rotas Como obter, evolucoes e formas. */
export async function runSpeciesDerive(ctx: PipelineContext): Promise<void> {
  const species = ctx.species;

  const slugToDex = new Map<string, number>();
  for (const ms of species.values()) slugToDex.set(ms.slug, ms.dex);

  // B2.3 passo 1: spawns de todos os jars + kubejs, agrupados por especie.
  const spawnsBySlug = collectSpawnsBySlug(ctx);
  const spawnsByDex = new Map<number, SpawnEntry[]>();
  let totalSpawnEntries = 0;
  for (const [slug, entries] of spawnsBySlug) {
    const dex = slugToDex.get(slug);
    if (dex === undefined) {
      ctx.report.warn("W_SPAWN_UNMATCHED", `spawn de especie desconhecida no dataset: ${slug}`, { slug, count: entries.length });
      continue;
    }
    const list = spawnsByDex.get(dex) ?? [];
    list.push(...entries);
    spawnsByDex.set(dex, list);
    totalSpawnEntries += entries.length;
  }
  ctx.setCount("spawnEntries", totalSpawnEntries);

  // B2.3 passo 2: raridade por especie.
  const rarityByDex = new Map<number, RarityInfo>();
  for (const ms of species.values()) rarityByDex.set(ms.dex, deriveRarity(spawnsByDex.get(ms.dex) ?? []));

  // B2.3 passo 3: fosseis (uniao de todos os jars + kubejs).
  const fossils = resolveFossils(collectFossils(ctx), slugToDex, ctx.report);
  ctx.setCount("fossilRoutes", fossils.length);
  const fossilsBySlug = new Map(fossils.map((f) => [f.resultSlug, f] as const));

  // Arestas de evolucao (usadas por obtain.ts e pelo passo B2.4 abaixo; independente da ordem das etapas,
  // ja que sao puras/derivadas so de MergedSpecies.evolutionsRaw).
  const edgesByDex = new Map<number, EvolutionEdge[]>();
  for (const ms of species.values()) edgesByDex.set(ms.dex, edgesForSpecies(ms, slugToDex, ctx.report));

  // B2.3 passo 4: rotas "Como obter" (memoizadas: a regra de evolucao precisa da resposta da pre-evolucao).
  const obtainDeps: ObtainDeps = {
    species,
    slugToDex,
    spawnsByDex,
    rarityByDex,
    fossilsBySlug,
    findEdge: (from, to) => findEdge(edgesByDex, from, to),
  };
  const obtainMemo = new Map<number, ObtainRoute[]>();
  for (const ms of species.values()) deriveSpeciesObtain(ms.dex, obtainDeps, obtainMemo);

  // B2.4: cadeia completa por familia (mesma cadeia gravada em cada especie da familia).
  const chainByRoot = new Map<number, EvolutionChain>();
  const chainOf = (dex: number): EvolutionChain => {
    const root = findChainRoot(dex, species, slugToDex, ctx.report);
    let chain = chainByRoot.get(root);
    if (!chain) {
      chain = buildChain(root, species, edgesByDex);
      chainByRoot.set(root, chain);
    }
    return chain;
  };

  // B2.4: itens de ativacao de Mega/Mega-Z (varredura unica dos jars mega_showdown/zamega).
  const megaDefs = collectMegaItemDefs(ctx);

  // Grava tudo em ctx.species (ver nota de topo sobre DerivedSpecies).
  for (const ms of species.values()) {
    const derived = ms as DerivedSpecies;
    derived.spawns = spawnsByDex.get(ms.dex) ?? [];
    derived.rarity = rarityByDex.get(ms.dex) ?? { primary: null, secondary: [] };
    derived.obtain = obtainMemo.get(ms.dex) ?? [{ kind: "none" }];
    derived.evolutions = edgesByDex.get(ms.dex) ?? [];
    derived.preEvolution = resolvePreEvolution(ms, slugToDex, species);
    derived.evolutionChain = chainOf(ms.dex);
    derived.resolvedForms = ms.forms.map((form) => resolveForm(ms, form, megaDefs));
  }
}

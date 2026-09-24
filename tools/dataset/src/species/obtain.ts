// B2.3 (so build-time): rotas "Como obter" da especie, ordem e regras de SPEC 5.1.5.
import type { EvolutionEdge, FossilRoute, ObtainAddon, ObtainRoute, RarityInfo, SpawnEntry } from "../../../../src/data/types";
import type { MergedSpecies } from "../context";

const ADDON_MAP: Readonly<Record<string, ObtainAddon>> = {
  legendarymonuments: "legendarymonuments",
  ccc: "ccc",
};

export interface ObtainDeps {
  species: ReadonlyMap<number, MergedSpecies>;
  slugToDex: ReadonlyMap<string, number>;
  spawnsByDex: ReadonlyMap<number, SpawnEntry[]>;
  rarityByDex: ReadonlyMap<number, RarityInfo>;
  fossilsBySlug: ReadonlyMap<string, FossilRoute>;
  /** aresta especifica fromDex -> toDex, resolvida via evolutions.ts (independente da ordem das etapas). */
  findEdge: (fromDex: number, toDex: number) => EvolutionEdge | null;
}

/**
 * Rotas "Como obter" com memoizacao (a regra (1) precisa saber se a pre-evolucao e obtenivel, recursivamente
 * ate a raiz da familia); ciclo de dados quebrado e cortado com um guarda de visita.
 */
export function deriveSpeciesObtain(
  dex: number,
  deps: ObtainDeps,
  memo: Map<number, ObtainRoute[]> = new Map(),
  visiting: Set<number> = new Set(),
): ObtainRoute[] {
  const cached = memo.get(dex);
  if (cached) return cached;
  if (visiting.has(dex)) return [];
  visiting.add(dex);

  const routes: ObtainRoute[] = [];
  const ms = deps.species.get(dex);
  if (ms) {
    // (1) evolution: preEvolution obtenivel (spawn proprio OU, recursivamente, ela mesma via evolucao)
    if (ms.preEvolutionRaw) {
      const parentSlug = ms.preEvolutionRaw.split(" ")[0] as string;
      const parentDex = deps.slugToDex.get(parentSlug);
      if (parentDex !== undefined) {
        const parentRarity = deps.rarityByDex.get(parentDex);
        const parentHasSpawn = parentRarity?.primary != null;
        const parentObtain = deriveSpeciesObtain(parentDex, deps, memo, visiting);
        const parentReachableViaEvolution = parentObtain.some((r) => r.kind === "evolution");
        if (parentHasSpawn || parentReachableViaEvolution) {
          const edge = deps.findEdge(parentDex, ms.dex);
          const parent = deps.species.get(parentDex);
          if (edge && parent) {
            routes.push({ kind: "evolution", from: parentDex, fromSlug: parent.slug, edge, fromHasSpawn: parentHasSpawn });
          }
        }
      }
    }

    // (2) fossil
    const fossil = deps.fossilsBySlug.get(ms.slug);
    if (fossil) routes.push({ kind: "fossil", items: fossil.fossils, source: fossil.source });

    const spawns = deps.spawnsByDex.get(dex) ?? [];

    // (3) packSpawn: source kubejs ou allthemons
    const packEntries = spawns.filter((s) => s.source === "kubejs" || s.source === "allthemons");
    if (packEntries.length > 0) routes.push({ kind: "packSpawn", entries: packEntries });

    // (4) addon: legendarymonuments ou ccc
    for (const addonSource of ["legendarymonuments", "ccc"] as const) {
      const entries = spawns.filter((s) => s.source === addonSource);
      if (entries.length > 0) {
        routes.push({ kind: "addon", addon: ADDON_MAP[addonSource] as ObtainAddon, entries });
      }
    }

    // (5) breeding: eggGroups nao contem undiscovered
    if (!ms.eggGroups.includes("undiscovered")) {
      routes.push({ kind: "breeding", eggGroups: ms.eggGroups });
    }

    // ASSUMPTION (SPEC 5.1.5): Ultra Wormholes nao tem datapack de spawn legivel; species ultra_beast
    // sem NENHUMA outra rota confirmada ganham addon "ultrawormholes" honesto (sem entries); Raid Dens
    // nao entra (nenhuma rota confirmada por dados existe, RF-69).
    if (routes.length === 0 && ms.labels.includes("ultra_beast")) {
      routes.push({ kind: "addon", addon: "ultrawormholes" });
    }
  }

  if (routes.length === 0) routes.push({ kind: "none" });
  visiting.delete(dex);
  memo.set(dex, routes);
  return routes;
}

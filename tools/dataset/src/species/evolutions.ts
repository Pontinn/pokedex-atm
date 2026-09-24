// B2.4: evolutions[] cru -> EvolutionEdge[], cadeia completa (BFS a partir da raiz) (SPEC 5.1.2, 5.1.3, 5.1.5).
import type { EvolutionChain, EvolutionChainNode, EvolutionEdge, EvolutionRequirement, EvolutionVariant, TypeId } from "../../../../src/data/types";
import type { MergedSpecies, ReportSink } from "../context";

const TYPE_IDS: ReadonlySet<string> = new Set<TypeId>([
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
]);
const isTypeId = (v: unknown): v is TypeId => typeof v === "string" && TYPE_IDS.has(v);

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, fallback = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

/** Primeiro token antes do espaco: "toxtricity punk_form=amped" -> "toxtricity" (result/preEvolution podem trazer aspecto). */
export function baseSlugOf(raw: string): string {
  return raw.split(" ")[0] as string;
}

function mapVariant(v: unknown): EvolutionVariant {
  return v === "level_up" || v === "item_interact" || v === "trade" || v === "block_click" ? v : "other";
}

function mapRequirement(raw: unknown): EvolutionRequirement {
  if (!isObject(raw)) return { kind: "other", raw: {} };
  switch (raw.variant) {
    case "level":
      return { kind: "level", minLevel: num(raw.minLevel) };
    case "friendship":
      return { kind: "friendship", amount: num(raw.amount) };
    case "time_range":
      return { kind: "timeRange", range: typeof raw.range === "string" ? raw.range : "" };
    case "has_move_type":
      return isTypeId(raw.type) ? { kind: "hasMoveType", type: raw.type } : { kind: "other", raw };
    case "held_item":
      return { kind: "heldItem", item: typeof raw.itemCondition === "string" ? raw.itemCondition : "" };
    default:
      return { kind: "other", raw };
  }
}

/** Converte UMA entrada crua de evolutions[] em EvolutionEdge; null se o slug de destino nao existe (aresta descartada + report). */
export function parseEvolutionEdge(
  fromDex: number,
  raw: unknown,
  slugToDex: ReadonlyMap<string, number>,
  report?: ReportSink,
): EvolutionEdge | null {
  if (!isObject(raw) || typeof raw.result !== "string") return null;
  const toSlug = baseSlugOf(raw.result);
  const toDex = slugToDex.get(toSlug);
  if (toDex === undefined) {
    report?.warn("W_EVOLUTION_UNMATCHED", `evolucao de ${fromDex} aponta para slug desconhecido: ${toSlug}`, { fromDex, result: raw.result });
    return null;
  }
  return {
    id: typeof raw.id === "string" ? raw.id : `${fromDex}-${toDex}`,
    from: fromDex,
    to: toDex,
    toSlug,
    variant: mapVariant(raw.variant),
    requiredItem: typeof raw.requiredContext === "string" ? raw.requiredContext : null,
    requirements: Array.isArray(raw.requirements) ? raw.requirements.map(mapRequirement) : [],
  };
}

/** Todas as arestas de SAIDA de uma especie. */
export function edgesForSpecies(ms: MergedSpecies, slugToDex: ReadonlyMap<string, number>, report?: ReportSink): EvolutionEdge[] {
  const out: EvolutionEdge[] = [];
  for (const raw of ms.evolutionsRaw) {
    const edge = parseEvolutionEdge(ms.dex, raw, slugToDex, report);
    if (edge) out.push(edge);
  }
  return out;
}

/**
 * Arestas de saida que NAO estao em evolutions[] da especie base (so para a rota "Como obter", nao entram
 * na cadeia publicada): (1) evolutions[] das formas (ex. "corsola galarian" -> cursola fica em
 * forms[Galar].evolutions; Obstagoon, Sirfetch'd, Mr. Rime, Perrserker, Runerigus, Overqwil, Sneasler,
 * Clodsire, Basculegion); (2) "shedder" (nincada_ninjask.shedder = "shedinja": a Shedinja surge na mesma
 * evolucao, com os mesmos requisitos). BUGFIX auditoria A1: sem isso a rota evolution sumia.
 */
export function extraEdgesForSpecies(ms: MergedSpecies, slugToDex: ReadonlyMap<string, number>): EvolutionEdge[] {
  const out: EvolutionEdge[] = [];
  for (const form of ms.forms) {
    const list = Array.isArray(form.raw.evolutions) ? form.raw.evolutions : [];
    for (const raw of list) {
      const edge = parseEvolutionEdge(ms.dex, raw, slugToDex);
      if (edge) out.push(edge);
    }
  }
  const all = [...ms.evolutionsRaw, ...ms.forms.flatMap((f) => (Array.isArray(f.raw.evolutions) ? f.raw.evolutions : []))];
  for (const raw of all) {
    if (!isObject(raw) || typeof raw.shedder !== "string") continue;
    const edge = parseEvolutionEdge(ms.dex, { ...raw, result: raw.shedder, id: `${String(raw.id ?? ms.dex)}_shedder` }, slugToDex);
    if (edge) out.push(edge);
  }
  return out;
}

/** Aresta especifica de fromDex -> toDex (usada por obtain.ts, sem depender da ordem das etapas). */
export function findEdge(edgesByDex: ReadonlyMap<number, EvolutionEdge[]>, fromDex: number, toDex: number): EvolutionEdge | null {
  return edgesByDex.get(fromDex)?.find((e) => e.to === toDex) ?? null;
}

export function resolvePreEvolution(
  ms: MergedSpecies,
  slugToDex: ReadonlyMap<string, number>,
  species: ReadonlyMap<number, MergedSpecies>,
): { dex: number; slug: string } | null {
  if (!ms.preEvolutionRaw) return null;
  const slug = baseSlugOf(ms.preEvolutionRaw);
  const dex = slugToDex.get(slug);
  if (dex === undefined) return null;
  return { dex, slug: species.get(dex)?.slug ?? slug };
}

/** Sobe por preEvolutionRaw ate a raiz da familia; corta apos 10 passos ou ciclo (dados quebrados) + report. */
export function findChainRoot(
  startDex: number,
  species: ReadonlyMap<number, MergedSpecies>,
  slugToDex: ReadonlyMap<string, number>,
  report?: ReportSink,
): number {
  let current = startDex;
  const seen = new Set<number>([current]);
  for (let i = 0; i < 10; i++) {
    const ms = species.get(current);
    const pre = ms ? resolvePreEvolution(ms, slugToDex, species) : null;
    if (!pre) return current;
    if (seen.has(pre.dex)) {
      report?.warn("W_EVOLUTION_CYCLE", `ciclo na cadeia de evolucao a partir de ${startDex}`, { startDex });
      return current;
    }
    seen.add(pre.dex);
    current = pre.dex;
  }
  report?.warn("W_EVOLUTION_CYCLE", `cadeia de evolucao com mais de 10 passos a partir de ${startDex}`, { startDex });
  return current;
}

/** BFS a partir da raiz coletando nos e arestas (mesma cadeia gravada em cada especie da familia). */
export function buildChain(
  rootDex: number,
  species: ReadonlyMap<number, MergedSpecies>,
  edgesByDex: ReadonlyMap<number, EvolutionEdge[]>,
): EvolutionChain {
  const nodes: EvolutionChainNode[] = [];
  const edges: EvolutionEdge[] = [];
  const visited = new Set<number>();
  const queue: number[] = [rootDex];
  while (queue.length > 0) {
    const dex = queue.shift() as number;
    if (visited.has(dex)) continue;
    visited.add(dex);
    const ms = species.get(dex);
    if (!ms) continue;
    nodes.push({ dex: ms.dex, slug: ms.slug, name: ms.name, types: ms.types });
    for (const edge of edgesByDex.get(dex) ?? []) {
      edges.push(edge);
      if (!visited.has(edge.to)) queue.push(edge.to);
    }
  }
  return { root: rootDex, nodes, edges };
}

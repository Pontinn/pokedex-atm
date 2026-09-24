// B2.4: forms[] cru -> SpeciesForm[], com os itens de ativacao de Mega/Mega-Z (SPEC 5.1.3, 5.1.5 passo 2).
import type { SpeciesForm } from "../../../../src/data/types";
import type { MergedForm, MergedSpecies, PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";
import type { JarId } from "../source-reader";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** minusculo, sem espacos/pontuacao, para casar "Charizard"/"charizard" e resistir a "Mr. Mime". */
export function normalizeMegaName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface MegaItemDef {
  /** nomes de pokemons[] normalizados */
  pokemonNames: string[];
  /** parte apos "mega_evolution=" em aspect_conditions.apply.aspects, ex. "mega_x", "mega_y", "mega" */
  aspect: string | null;
  /** id completo do item, ex. "mega_showdown:charizardite_x" */
  itemId: string;
}

interface MegaSourceSpec {
  jarId: JarId;
  /** caminho verificado no snapshot (mega_showdown 81 arquivos; zamega 12) */
  prefix: string;
  /** namespace do item registrado (confirmado no lang: item.zamega.zygardite) */
  namespace: string;
}

const MEGA_SOURCES: readonly MegaSourceSpec[] = [
  { jarId: "mega_showdown", prefix: "data/mega_showdown/mega_showdown/mega/", namespace: "mega_showdown" },
  // Mega-Z (zamega): mesma heuristica (pokemons + aspecto). Os arquivos ficam em data/zamega/mega_showdown/mega/,
  // mesmo esquema e mesmo registro de Mega do mega_showdown (dependencia obrigatoria do zamega), e o lang do
  // zamega descreve cada pedra como "Mega Evolve into Mega <X> Z": a ativacao e a Mega Evolucao do
  // mega_showdown, que exige a keystone (Mega Bracelet). BUGFIX auditoria A1: antes sem keystone.
  { jarId: "zamega", prefix: "data/zamega/mega_showdown/mega/", namespace: "zamega" },
];

function parseMegaFile(data: unknown, namespace: string, fileName: string): MegaItemDef | null {
  if (!isObject(data) || !Array.isArray(data.pokemons)) return null;
  const pokemonNames = data.pokemons.filter((p): p is string => typeof p === "string").map(normalizeMegaName);
  if (pokemonNames.length === 0) return null;
  const applyAspects = isObject(data.aspect_conditions) && isObject(data.aspect_conditions.apply) ? data.aspect_conditions.apply.aspects : null;
  const aspectEntry = Array.isArray(applyAspects)
    ? applyAspects.find((a): a is string => typeof a === "string" && a.startsWith("mega_evolution="))
    : null;
  const aspect = aspectEntry ? aspectEntry.slice("mega_evolution=".length) : null;
  return { pokemonNames, aspect, itemId: `${namespace}:${fileName}` };
}

/** Varre os arquivos de item de mega_showdown e zamega (SPEC 5.1.5 passo 2a/2b). */
export function collectMegaItemDefs(ctx: Pick<PipelineContext, "reader">): MegaItemDef[] {
  const defs: MegaItemDef[] = [];
  for (const spec of MEGA_SOURCES) {
    const jars = ctx.reader.listJars().filter((j) => j.id === spec.jarId);
    for (const jar of jars) {
      const entries = ctx.reader.readJar(jar, [spec.prefix]);
      for (const { path, data } of readJsonEntries(entries, spec.prefix, jar.fileName)) {
        const fileName = (path.split("/").pop() ?? path).replace(/\.json$/, "");
        const parsed = parseMegaFile(data, spec.namespace, fileName);
        if (parsed) defs.push(parsed);
      }
    }
  }
  return defs;
}

/** Itens de ativacao para uma forma Mega/Mega-X/Mega-Y/Mega-Z; [] para Gmax e demais (SPEC 5.1.5 passo 2c). */
export function requiredItemsFor(ms: MergedSpecies, form: MergedForm, megaDefs: readonly MegaItemDef[]): string[] {
  const speciesNames = new Set([normalizeMegaName(ms.slug), normalizeMegaName(ms.name.en)]);
  const matches = megaDefs.filter(
    (d) => d.aspect !== null && form.aspects.includes(d.aspect) && d.pokemonNames.some((n) => speciesNames.has(n)),
  );
  if (matches.length === 0) return [];
  const itemIds = new Set(matches.map((m) => m.itemId));
  // toda pedra do registro de Mega do mega_showdown (mega_showdown e zamega) exige a keystone
  itemIds.add("mega_showdown:keystone");
  return [...itemIds];
}

/** Converte uma MergedForm (forma crua, com origem) em SpeciesForm (contrato de saida). */
export function resolveForm(ms: MergedSpecies, form: MergedForm, megaDefs: readonly MegaItemDef[]): SpeciesForm {
  return {
    name: form.name,
    aspects: form.aspects,
    battleOnly: form.battleOnly,
    labels: form.labels,
    // forma sem tipos/habilidades proprios herda os da especie base (nao redefine, SPEC 5.1.3 MergedForm).
    types: form.types.length > 0 ? form.types : ms.types,
    baseStats: form.baseStats,
    abilities: form.abilities.length > 0 ? form.abilities : ms.abilities,
    source: form.source,
    requiredItems: requiredItemsFor(ms, form, megaDefs),
    // PokeAPI (variantId de artwork) esta fora do escopo de B2.3/B2.4 (Consumes: so B2.2); preenchido null
    // aqui e documentado no handoff para quem monta species/<dex>.json (B2.5, Onda 2).
    artworkId: null,
  };
}

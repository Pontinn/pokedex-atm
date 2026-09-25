// Filtro da Pokedex (F3.2; RF-11..14, RF-53, RF-07): texto (numero ou nome PT/EN sem acento, B6.5) E tipos (OR entre
// tipos, app.js:736) E geracao E metodo de evolucao E status capturado, mantendo a ordenacao escolhida.
// Funcao pura (testada em unidade) + hook memoizado que le so o proprio slice da pilha e dos capturados (RF-04).
import { useMemo } from "react";
import type { SpeciesSummary } from "../../data/types";
import { normalizeSearch, parseDexQuery } from "../../domain/search";
import { useNavigationStore } from "../../navigation/navigation-store";
import type { DexFilters, DexSort, DexStatusFilter } from "../../navigation/types";
import { useCapturedStore, type CapturedEntries } from "../../state/captured-store";
import { useDatasetStore } from "../../state/dataset-store";

export const EVOLUTION_FILTERS = ["level", "item", "friendship", "trade", "move", "other", "none"] as const;

/** Texto casa numero ("25", "#025") ou parte do nome PT/EN normalizado; so espacos = sem filtro. */
export function matchesQuery(species: SpeciesSummary, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  const dex = parseDexQuery(trimmed);
  if (dex !== null) return species.dex === dex;
  const norm = normalizeSearch(trimmed);
  if (!norm) return true;
  return species.searchKey.split("|").some((part) => part.includes(norm));
}

export function sortSpecies(list: SpeciesSummary[], sort: DexSort, lang: "pt" | "en"): SpeciesSummary[] {
  if (sort === "name") {
    const collator = new Intl.Collator(lang === "pt" ? "pt-BR" : "en", { sensitivity: "base" });
    return list.sort((a, b) => collator.compare(a.name[lang] || a.name.en, b.name[lang] || b.name.en) || a.dex - b.dex);
  }
  if (sort === "bst") return list.sort((a, b) => b.bst - a.bst || a.dex - b.dex);
  return list.sort((a, b) => a.dex - b.dex);
}

export interface FilterOptions {
  filters: DexFilters;
  sort: DexSort;
  status: DexStatusFilter;
  captured: CapturedEntries;
  lang: "pt" | "en";
}

export function filterSpecies(index: readonly SpeciesSummary[], opts: FilterOptions): SpeciesSummary[] {
  const { filters, status, captured } = opts;
  const out = index.filter(
    (s) =>
      (filters.types.length === 0 || s.types.some((t) => filters.types.includes(t))) &&
      (filters.generation === null || s.generation === filters.generation) &&
      (filters.evolution === null || s.evolutionMethods.includes(filters.evolution as SpeciesSummary["evolutionMethods"][number])) &&
      (status === "all" || (status === "caught") === String(s.dex) in captured) &&
      matchesQuery(s, filters.query),
  );
  return sortSpecies(out, opts.sort, opts.lang);
}

/** "gen1".."gen9" pelo numero, sufixos (gen7b, gen8a) depois do numero base, "custom" por ultimo. */
export function sortGenerations(gens: Iterable<string>): string[] {
  const key = (g: string): [number, string] => {
    const m = /^gen(\d+)([a-z]*)$/.exec(g);
    return m ? [Number(m[1]), m[2] ?? ""] : [Number.POSITIVE_INFINITY, g];
  };
  return [...new Set(gens)].sort((a, b) => {
    const [na, sa] = key(a);
    const [nb, sb] = key(b);
    return na !== nb ? na - nb : sa.localeCompare(sb);
  });
}

/** Lista filtrada da Pokedex (so re-renderiza quem usa, ao mudar filtro/ordem/status/capturados). */
export function useFilteredSpecies(lang: "pt" | "en"): SpeciesSummary[] | null {
  const index = useDatasetStore((s) => s.speciesIndex);
  const filters = useNavigationStore((s) => (s.current.screen === "dex" ? (s.current.ui as { filters: DexFilters }).filters : null));
  const sort = useNavigationStore((s) => (s.current.screen === "dex" ? (s.current.ui as { sort: DexSort }).sort : "num"));
  const status = useNavigationStore((s) => (s.current.screen === "dex" ? (s.current.ui as { status: DexStatusFilter }).status : "all"));
  // capturados so importam para o filtro de status: sem ele, a lista nao depende dos capturados
  const captured = useCapturedStore((s) => (status === "all" ? EMPTY : s.entries));
  return useMemo(
    () => (index && filters ? filterSpecies(index, { filters, sort, status, captured, lang }) : null),
    [index, filters, sort, status, captured, lang],
  );
}

const EMPTY: CapturedEntries = {};

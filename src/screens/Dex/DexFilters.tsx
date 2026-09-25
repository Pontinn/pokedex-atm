// Filtros da Pokedex (F3.2; porta renderFilters app.js:729-732 e os selects de index.html:120-147): chips de tipo
// (multi; .on = selecionado, contorno = nao), geracao, metodo de evolucao, ordenacao e status. Estado em
// current.ui (pilha, RF-01/02); este bloco nao depende da lista, entao nao re-renderiza a cada filtro (mantem o foco).
import { memo, useMemo } from "react";
import { Check } from "../../components/Icon";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TypeIcon } from "../../components/TypeIcon";
import { typeName } from "../../components/TypeChip";
import type { TypeId } from "../../data/types";
import { TYPE_IDS } from "../../domain/type-chart";
import { useT } from "../../i18n/useT";
import { useNavigationStore } from "../../navigation/navigation-store";
import type { DexFilters as DexFiltersState, DexSort, DexStatusFilter } from "../../navigation/types";
import { useDatasetStore } from "../../state/dataset-store";
import { usePreferencesStore } from "../../state/preferences-store";
import { ListSearch } from "./ListSearch";
import { EVOLUTION_FILTERS, sortGenerations } from "./use-filtered-species";

type DexUi = { filters: DexFiltersState; sort: DexSort; status: DexStatusFilter };

function dexUi(): DexUi {
  return useNavigationStore.getState().current.ui as DexUi;
}

function patchFilters(patch: Partial<DexFiltersState>) {
  const ui = dexUi();
  useNavigationStore.getState().updateUi<"dex">({ filters: { ...ui.filters, ...patch } });
}

export function genLabel(gen: string, t: (k: string, v?: Record<string, string | number>) => string): string {
  if (gen === "custom") return t("dex.genCustom");
  const m = /^gen(\d+)([a-z]*)$/.exec(gen);
  return m ? t("dex.genN", { n: `${m[1]}${m[2] ?? ""}` }) : gen;
}

export const DexSearch = memo(function DexSearch() {
  const initial = useNavigationStore((s) => (s.current.ui as DexUi).filters?.query ?? "");
  // `initial` so vale no 1o render (restaurado da pilha); depois o texto e local
  return (
    <ListSearch
      id="dex-search"
      initial={initial}
      onQuery={(query) => patchFilters({ query })}
      placeholderKey="dex.searchPh"
      labelKey="dex.searchLabel"
    />
  );
});

const TypeChips = memo(function TypeChips() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const selected = useNavigationStore((s) => (s.current.ui as DexUi).filters?.types ?? []);
  const toggle = (type: TypeId) => {
    const types = dexUi().filters.types;
    patchFilters({ types: types.includes(type) ? types.filter((x) => x !== type) : [...types, type] });
  };
  return (
    <div className="filter-group">
      <label id="f-type-label">{t("dex.type")}</label>
      <div className="chips-scroll" id="filter-types" role="group" aria-labelledby="f-type-label">
        {TYPE_IDS.map((type) => {
          const on = selected.includes(type);
          return (
            <button
              key={type}
              type="button"
              className={`chip sm t-${type}${on ? " on" : ""}`}
              data-ftype={type}
              aria-pressed={on}
              onClick={() => toggle(type)}
            >
              <TypeIcon type={type} />
              <span>{typeName(type, lang)}</span>
              <Check className="chip-check" />
            </button>
          );
        })}
      </div>
    </div>
  );
});

const SelectsAndStatus = memo(function SelectsAndStatus() {
  const t = useT();
  const index = useDatasetStore((s) => s.speciesIndex);
  const generation = useNavigationStore((s) => (s.current.ui as DexUi).filters?.generation ?? null);
  const evolution = useNavigationStore((s) => (s.current.ui as DexUi).filters?.evolution ?? null);
  const sort = useNavigationStore((s) => (s.current.ui as DexUi).sort ?? "num");
  const status = useNavigationStore((s) => (s.current.ui as DexUi).status ?? "all");
  const gens = useMemo(() => sortGenerations((index ?? []).map((s) => s.generation)), [index]);
  const update = useNavigationStore((s) => s.updateUi);
  return (
    <div className="filter-row">
      <div className="filter-group">
        <label htmlFor="f-gen">{t("dex.gen")}</label>
        <select id="f-gen" value={generation ?? "all"} onChange={(e) => patchFilters({ generation: e.target.value === "all" ? null : e.target.value })}>
          <option value="all">{t("dex.all")}</option>
          {gens.map((g) => (
            <option key={g} value={g}>
              {genLabel(g, t)}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="f-evo">{t("dex.evo")}</label>
        <select id="f-evo" value={evolution ?? "all"} onChange={(e) => patchFilters({ evolution: e.target.value === "all" ? null : e.target.value })}>
          <option value="all">{t("dex.all")}</option>
          {EVOLUTION_FILTERS.map((m) => (
            <option key={m} value={m}>
              {t(`dex.evoMethod.${m}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="f-sort">{t("dex.sort")}</label>
        <select id="f-sort" value={sort} onChange={(e) => update<"dex">({ sort: e.target.value as DexSort })}>
          <option value="num">{t("dex.byNum")}</option>
          <option value="name">{t("dex.byName")}</option>
          <option value="bst">{t("dex.byBst")}</option>
        </select>
      </div>
      <div className="filter-group filter-seg">
        <label>{t("dex.status")}</label>
        <SegmentedControl<DexStatusFilter>
          ariaLabel={t("dex.status")}
          value={status}
          onChange={(v) => update<"dex">({ status: v })}
          options={[
            { value: "all", label: t("dex.all") },
            { value: "caught", label: t("dex.onlyCaught") },
            { value: "missing", label: t("dex.onlyMissing") },
          ]}
        />
      </div>
    </div>
  );
});

export const DexFilters = memo(function DexFilters() {
  return (
    <div className="filters" id="filters">
      <TypeChips />
      <SelectsAndStatus />
    </div>
  );
});

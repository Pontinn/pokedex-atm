// T1.2 (type-chart): tela Tipos montada inteira (Testing Library). Esperados de faixas e matriz DERIVADOS de
// TYPE_CHART no teste; textos por translate (dicionario). A tela nao usa dataset: sem mock de loaders.
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TypeId } from "../../../src/data/types";
import { TYPE_CHART, TYPE_IDS } from "../../../src/domain/type-chart";
import { translate } from "../../../src/i18n/useT";
import { TYPE_NAMES } from "../../../src/i18n/types";
import { resetNavigationStore, useNavigationStore } from "../../../src/navigation/navigation-store";
import { defaultUi } from "../../../src/navigation/types";
import { TypesScreen } from "../../../src/screens/Types/TypesScreen";
import { resetPreferencesStore, usePreferencesStore } from "../../../src/state/preferences-store";

const tr = (key: Parameters<typeof translate>[1], vars?: Record<string, string>) => translate("pt", key, vars);
const SINGLE = [2, 0.5, 0] as const;

function ref(atk: TypeId, def: TypeId): number {
  const row = TYPE_CHART[atk];
  if (row[2].includes(def)) return 2;
  if (row[0.5].includes(def)) return 0.5;
  if (row[0].includes(def)) return 0;
  return 1;
}

function mount() {
  useNavigationStore.setState({ current: { id: 99, screen: "types", params: {}, ui: defaultUi("types"), scroll: 0 }, stack: [] });
  return render(<TypesScreen entryId={99} params={{}} />);
}

const q = (sel: string) => document.querySelector(sel) as HTMLElement | null;
const qa = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[];
const ui = () => useNavigationStore.getState().current.ui as ReturnType<typeof defaultUi<"types">>;
const click = (el: Element | null) => act(() => void fireEvent.click(el!));
const tabButton = (label: string) => qa(".tp-tab button").find((b) => b.textContent === label) ?? null;
const viewButton = (label: string) => qa(".tp-view button").find((b) => b.textContent === label) ?? null;
const bandTypes = () => qa(".tp-band").map((b) => [...b.querySelectorAll("[data-type]")].map((e) => e.getAttribute("data-type")));

beforeEach(() => {
  resetNavigationStore();
  resetPreferencesStore();
});
afterEach(() => cleanup());

describe("TypesScreen", () => {
  it("starts on By type with the 18 chips, the instruction and no detail", () => {
    mount();
    expect(viewButton(tr("types.viewByType"))?.getAttribute("aria-pressed")).toBe("true");
    expect(qa(".tp-pick").map((b) => b.textContent)).toEqual(TYPE_IDS.map((t) => TYPE_NAMES[t].pt));
    expect(qa('.tp-pick[aria-pressed="true"]')).toHaveLength(0);
    expect(q(".tp-instr")?.textContent).toBe(tr("types.pick"));
    for (const sel of [".tp-hero", ".tp-tab", ".tp-band", "table.tp-matrix"]) expect(q(sel)).toBeNull();
  });

  it("shows the hero, hint and 3 attack bands for Fire; re-tapping is a no-op", () => {
    mount();
    click(q('[data-pick="fire"]'));
    expect(qa('.tp-pick[aria-pressed="true"]').map((b) => b.dataset.pick)).toEqual(["fire"]);
    expect(q('.tp-hero[data-hero="fire"] h3')?.textContent).toBe("Fogo");
    expect(q(".tp-hint")?.textContent).toBe(tr("types.hint.fire"));
    expect(tabButton(tr("types.tabAttack"))?.getAttribute("aria-pressed")).toBe("true");
    expect(qa(".tp-band").map((b) => b.dataset.tone)).toEqual(["adv", "dis", "zero"]);
    expect(qa(".tp-band h4").map((h) => h.textContent)).toEqual([tr("types.atk2"), tr("types.atkHalf"), tr("types.atk0")]);
    expect(q(".tp-instr")).toBeNull();

    const before = useNavigationStore.getState().current;
    click(q('[data-pick="fire"]'));
    expect(useNavigationStore.getState().current).toBe(before);
    for (const t of ["water", "grass", "ice", "rock", "fire"]) click(q(`[data-pick="${t}"]`));
    for (let i = 0; i < 2; i++) {
      click(tabButton(tr("types.tabDefend")));
      click(tabButton(tr("types.tabAttack")));
    }
    expect(useNavigationStore.getState().stack).toHaveLength(0);
    expect(useNavigationStore.getState().current.id).toBe(99);
  });

  it("derives the attack and defense bands of all 18 types from TYPE_CHART", () => {
    mount();
    for (const x of TYPE_IDS) {
      click(q(`[data-pick="${x}"]`));
      expect(bandTypes()).toEqual(SINGLE.map((m) => TYPE_IDS.filter((d) => ref(x, d) === m)));
      click(tabButton(tr("types.tabDefend")));
      expect(qa(".tp-band h4").map((h) => h.textContent)).toEqual([tr("types.def2"), tr("types.defHalf"), tr("types.def0")]);
      expect(qa(".tp-band").map((b) => b.dataset.tone)).toEqual(["dis", "adv", "zero"]);
      const exp = SINGLE.map((m) => TYPE_IDS.filter((a) => ref(a, x) === m));
      expect(bandTypes()).toEqual(exp);
      qa(".tp-band").forEach((b, i) => {
        if (exp[i]!.length === 0) expect(b.querySelector(".tp-none")?.textContent).toBe(tr("types.none"));
      });
      expect(ui().selected).toBe(x);
      click(tabButton(tr("types.tabAttack")));
    }
  });

  it("switches names, legend and hint with uiLanguage and ignores the terms toggle", () => {
    mount();
    click(q('[data-pick="fire"]'));
    click(tabButton(tr("types.tabDefend")));
    act(() => usePreferencesStore.setState({ uiLanguage: "en" }));
    expect(q(".tp-hero h3")?.textContent).toBe("Fire");
    expect(q(".tp-band h4")?.textContent).toBe(translate("en", "types.def2"));
    expect(q(".tp-hint")?.textContent).toBe(translate("en", "types.hint.fire"));
    expect(q(".tp-legend h3")?.textContent).toBe(translate("en", "types.legendTitle"));
    expect(ui().selected).toBe("fire");
    expect(ui().tab).toBe("defend");
    act(() => usePreferencesStore.setState({ uiLanguage: "pt", termsLanguage: "en", termsOverrides: { calc: "en", weak: "en" } }));
    expect(q(".tp-hero h3")?.textContent).toBe("Fogo");
    expect(q(".terms-tgl")).toBeNull();
  });

  it("renders the legend from the dictionary without tones on the multiplier lines", () => {
    mount();
    const check = () => {
      expect(qa(".tp-legend-list li").map((l) => l.textContent).slice(0, 3)).toEqual([tr("types.legend2"), tr("types.legendHalf"), tr("types.legend0")]);
      expect(qa(".tp-legend-color > span:last-child").map((s) => s.textContent)).toEqual([tr("types.legendBands"), tr("types.legendTable")]);
      expect(qa(".tp-legend-list li").filter((l) => /tone-/.test(l.className))).toHaveLength(0);
    };
    check();
    click(viewButton(tr("types.viewChart")));
    check();
  });

  it("shows the full chart with derived cells, labels and the selection highlight", () => {
    mount();
    click(viewButton(tr("types.viewChart")));
    expect(qa(".tp-matrix .is-sel, .tp-matrix .is-col")).toHaveLength(0);
    click(viewButton(tr("types.viewByType")));
    click(q('[data-pick="fire"]'));
    click(viewButton(tr("types.viewChart")));
    expect(q(".tp-grid")).toBeNull();
    expect(q(".tp-bands")).toBeNull();
    expect(qa("th[scope=col] button").map((b) => b.getAttribute("aria-label"))).toEqual(TYPE_IDS.map((t) => tr("types.colHeader", { type: TYPE_NAMES[t].pt })));
    expect(qa("th[scope=row] button").map((b) => b.getAttribute("aria-label"))).toEqual(TYPE_IDS.map((t) => tr("types.rowHeader", { type: TYPE_NAMES[t].pt })));
    const cells = qa("td.tp-cell");
    expect(cells).toHaveLength(324);
    const SYM: Record<number, string> = { 2: "2", 0.5: "1/2", 0: "0", 1: "" };
    const MS: Record<number, string> = { 2: "x2", 0.5: "x1/2", 0: "x0", 1: "x1" };
    for (const a of TYPE_IDS) {
      for (const d of TYPE_IDS) {
        const td = q(`tr[data-row="${a}"] td[data-def="${d}"]`)!;
        expect(td.textContent).toBe(SYM[ref(a, d)]);
        expect(td.getAttribute("aria-label")).toBe(tr("types.cellLabel", { atk: TYPE_NAMES[a].pt, def: TYPE_NAMES[d].pt, mult: MS[ref(a, d)]! }));
      }
    }
    expect(q('tr[data-row="fire"] td[data-def="grass"]')?.getAttribute("aria-label")).toBe("Fogo contra Planta: x2");
    expect(q('tr[data-row="fire"]')?.className).toContain("is-sel");
    expect(qa('td.is-col[data-def="fire"]')).toHaveLength(18);
    expect(qa('.tp-head[aria-pressed="true"]').map((b) => `${b.dataset.axis}:${b.dataset.type}`)).toEqual(["col:fire", "row:fire"]);

    click(q('button[data-axis="col"][data-type="water"]'));
    expect(ui().selected).toBe("water");
    expect(ui().view).toBe("chart");
    expect(qa('td.is-col[data-def="water"]')).toHaveLength(18);
    const before = useNavigationStore.getState().current;
    click(q('tr[data-row="fire"] td[data-def="grass"]'));
    expect(useNavigationStore.getState().current).toBe(before);
    click(viewButton(tr("types.viewByType")));
    expect(q('[data-pick="water"]')?.getAttribute("aria-pressed")).toBe("true");
  });

  it("[COULD] adds a second type only on Defending", () => {
    mount();
    click(q('[data-pick="water"]'));
    click(tabButton(tr("types.tabDefend")));
    const select = q("#tp-second") as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual(["", ...TYPE_IDS.filter((t) => t !== "water")]);
    expect([...select.options].slice(1).map((o) => o.textContent)).toEqual(TYPE_IDS.filter((t) => t !== "water").map((t) => TYPE_NAMES[t].pt));
    act(() => void fireEvent.change(select, { target: { value: "ground" } }));
    expect(qa(".tp-band")).toHaveLength(5);
    expect(q('.tp-band[data-mult="4"] [data-type="grass"]')).not.toBeNull();
    expect(q('.tp-band[data-mult="0"] [data-type="electric"]')).not.toBeNull();
    expect(qa(".tp-hero .tp-ti-xl")).toHaveLength(2);
    expect(q(".tp-hero h3")?.textContent).toBe("Água / Terra");
    act(() => void fireEvent.change(select, { target: { value: "flying" } }));
    expect(q('.tp-band[data-mult="4"] [data-type="electric"]')).not.toBeNull();
    act(() => void fireEvent.change(select, { target: { value: "" } }));
    expect(qa(".tp-band")).toHaveLength(3);
    act(() => void fireEvent.change(select, { target: { value: "ground" } }));
    click(tabButton(tr("types.tabAttack")));
    expect(q("#tp-second")).toBeNull();
    expect(qa(".tp-hero .tp-ti-xl")).toHaveLength(1);
    click(tabButton(tr("types.tabDefend")));
    expect((q("#tp-second") as HTMLSelectElement).value).toBe("ground");
    click(q('[data-pick="ground"]'));
    expect(ui().selected).toBe("ground");
    expect(ui().second).toBeNull();
  });
});

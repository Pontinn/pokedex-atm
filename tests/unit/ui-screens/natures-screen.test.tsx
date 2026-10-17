// natures (quick): tela Naturezas montada inteira (Testing Library). Esperados derivados de NATURES no teste;
// textos por translate (dicionario). A tela nao usa dataset: sem mock de loaders.
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NATURES, type BattleStatKey } from "../../../src/domain/natures";
import { translate } from "../../../src/i18n/useT";
import { resetNavigationStore, useNavigationStore } from "../../../src/navigation/navigation-store";
import { defaultUi } from "../../../src/navigation/types";
import { NaturesScreen } from "../../../src/screens/Natures/NaturesScreen";
import { resetPreferencesStore, usePreferencesStore } from "../../../src/state/preferences-store";

const tr = (key: Parameters<typeof translate>[1], vars?: Record<string, string>) => translate("pt", key, vars);
const LABEL: Record<BattleStatKey, Parameters<typeof translate>[1]> = {
  attack: "stat.atk",
  defence: "stat.def",
  specialAttack: "stat.spa",
  specialDefence: "stat.spd",
  speed: "stat.spe",
};

function mount() {
  useNavigationStore.setState({ current: { id: 99, screen: "natures", params: {}, ui: defaultUi("natures"), scroll: 0 }, stack: [] });
  return render(<NaturesScreen entryId={99} params={{}} />);
}

const q = (sel: string) => document.querySelector(sel) as HTMLElement | null;
const qa = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[];
const ui = () => useNavigationStore.getState().current.ui as ReturnType<typeof defaultUi<"natures">>;
const click = (el: Element | null) => act(() => void fireEvent.click(el!));
const viewButton = (label: string) => qa(".nt-view button").find((b) => b.textContent === label) ?? null;

beforeEach(() => {
  resetNavigationStore();
  resetPreferencesStore();
});
afterEach(() => cleanup());

describe("NaturesScreen", () => {
  it("starts on the table with 25 cells, the legend, the instruction and no focus", () => {
    mount();
    expect(q(".page-head h2")?.textContent).toBe(tr("nav.natures"));
    expect(q(".nt-legend")?.textContent).toContain(tr("natures.legendRule"));
    expect(viewButton(tr("natures.viewTable"))?.getAttribute("aria-pressed")).toBe("true");
    expect(qa(".nt-table [data-nature]")).toHaveLength(25);
    expect(new Set(qa(".nt-table [data-nature]").map((b) => b.dataset.nature))).toEqual(new Set(NATURES.map((n) => n.id)));
    expect(qa('.nt-table [data-neutral="true"]')).toHaveLength(5);
    expect(q(".nt-instr")?.textContent).toBe(tr("natures.pick"));
    expect(q(".nt-focus")).toBeNull();
  });

  it("row = raises, column = lowers: Adamant sits in row Attack, column Sp. Atk", () => {
    mount();
    const cell = q('.nt-table tr[data-up="attack"] td[data-down="specialAttack"] [data-nature]');
    expect(cell?.dataset.nature).toBe("adamant");
    expect(cell?.getAttribute("aria-label")).toBe(tr("natures.cellLabel", { name: "Rígida", up: tr("stat.atk"), down: tr("stat.spa") }));
  });

  it("selecting a cell shows the focus with +10%/-10% chips, the English name and the use hint", () => {
    mount();
    click(q('[data-nature="adamant"]'));
    expect(ui().selected).toBe("adamant");
    expect(q('[data-nature="adamant"]')?.getAttribute("aria-pressed")).toBe("true");
    expect(q('.nt-focus[data-focus="adamant"] h3')?.textContent).toBe("Rígida");
    expect(q(".nt-focus-alt")?.textContent).toBe("Adamant");
    expect(q('[data-chip="up"]')?.textContent).toBe(`+10% ${tr("stat.atk")}`);
    expect(q('[data-chip="down"]')?.textContent).toBe(`-10% ${tr("stat.spa")}`);
    expect(q(".nt-use")?.textContent).toBe(tr("natures.useHint", { up: tr("stat.atk"), down: tr("stat.spa") }));
    expect(q(".nt-instr")).toBeNull();
  });

  it("a neutral nature shows the gray chip and the neutral hint", () => {
    mount();
    click(q('[data-nature="hardy"]'));
    expect(q('[data-chip="neutral"]')?.textContent).toBe(tr("natures.chipNeutral"));
    expect(q('[data-chip="up"]')).toBeNull();
    expect(q(".nt-use")?.textContent).toBe(tr("natures.useNeutral"));
  });

  it("the page terms toggle starts on the global terms language and switching to EN inverts the names", () => {
    mount();
    expect(q('.page-head [data-tcard="natures"] [data-tl="pt"]')?.getAttribute("aria-pressed")).toBe("true");
    click(q('[data-tcard="natures"] [data-tl="en"]'));
    expect(usePreferencesStore.getState().termsOverrides.natures).toBe("en");
    const cell = q('.nt-table tr[data-up="attack"] td[data-down="specialAttack"] [data-nature]');
    expect(cell?.textContent).toBe("Adamant");
    expect(qa(".nt-table").map((e) => e.textContent).join(" ")).not.toContain("Rígida");
    expect(cell?.getAttribute("aria-label")).toBe(tr("natures.cellLabel", { name: "Adamant", up: tr("stat.atk"), down: tr("stat.spa") }));
    click(cell);
    expect(q(".nt-focus h3")?.textContent).toBe("Adamant");
    expect(q(".nt-focus-alt")?.textContent).toBe("Rígida");
    click(viewButton(tr("natures.viewByStat")));
    click(q('[data-stat="attack"]'));
    expect(q('[data-band="raise"] [data-nature="adamant"] .nt-pick-name')?.textContent).toBe("Adamant");
  });

  it("follows the global terms language without an override; the UI language alone does not change the names", () => {
    usePreferencesStore.setState({ uiLanguage: "en" });
    mount();
    expect(q('[data-nature="adamant"] .nt-pick-name')?.textContent).toBe("Rígida");
    cleanup();
    usePreferencesStore.setState({ uiLanguage: "pt", termsLanguage: "en" });
    mount();
    click(q('[data-nature="adamant"]'));
    expect(q(".nt-focus h3")?.textContent).toBe("Adamant");
    expect(q(".nt-focus-alt")?.textContent).toBe("Rígida");
  });

  it("By stat: pick Speed, 4 raise + 4 lower + 5 neutral, and picking one opens the focus", () => {
    mount();
    click(viewButton(tr("natures.viewByStat")));
    expect(ui().view).toBe("byStat");
    expect(q(".nt-table")).toBeNull();
    expect(qa(".nt-stat").map((b) => b.textContent)).toEqual(Object.values(LABEL).map((k) => tr(k)));
    expect(q(".nt-stat-instr")?.textContent).toBe(tr("natures.statPick"));
    expect(qa('[data-band="neutral"] [data-nature]').map((b) => b.dataset.nature)).toEqual(NATURES.filter((n) => n.up === null).map((n) => n.id));
    click(q('[data-stat="speed"]'));
    expect(ui().stat).toBe("speed");
    expect(q('[data-stat="speed"]')?.getAttribute("aria-pressed")).toBe("true");
    const raise = qa('[data-band="raise"] [data-nature]').map((b) => b.dataset.nature);
    const lower = qa('[data-band="lower"] [data-nature]').map((b) => b.dataset.nature);
    expect(new Set(raise)).toEqual(new Set(NATURES.filter((n) => n.up === "speed").map((n) => n.id)));
    expect(new Set(lower)).toEqual(new Set(NATURES.filter((n) => n.down === "speed").map((n) => n.id)));
    expect(q('[data-band="raise"] h4')?.textContent).toBe(tr("natures.raise", { stat: tr("stat.spe") }));
    expect(q('[data-band="raise"] [data-nature="jolly"] .nt-band-note')?.textContent).toBe(`-${tr("stat.spa")}`);
    expect(q('[data-band="lower"] [data-nature="brave"] .nt-band-note')?.textContent).toBe(`+${tr("stat.atk")}`);
    click(q('[data-band="raise"] [data-nature="jolly"]'));
    expect(ui().selected).toBe("jolly");
    expect(q('.nt-focus[data-focus="jolly"]')).not.toBeNull();
  });

  it("selection and stat survive switching views", () => {
    mount();
    click(q('[data-nature="timid"]'));
    click(viewButton(tr("natures.viewByStat")));
    click(q('[data-stat="attack"]'));
    click(viewButton(tr("natures.viewTable")));
    expect(ui()).toEqual({ view: "table", selected: "timid", stat: "attack" });
    expect(q('.nt-table [data-nature="timid"]')?.getAttribute("aria-pressed")).toBe("true");
  });
});

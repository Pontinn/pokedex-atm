// @vitest-environment node
// T1.1 (type-chart): modelo puro da pagina Tipos. Todo esperado de grupo, matriz e defesa dupla e DERIVADO de
// TYPE_CHART aqui no teste, por um caminho independente do modelo (listas TYPE_CHART[X][m]); as unicas constantes
// literais sao as do proprio requisito (exemplos nomeados de 5.5 / PRD RF-39..RF-44).
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { TypeId } from "../../../src/data/types";
import { TYPE_CHART, TYPE_IDS } from "../../../src/domain/type-chart";
import { defaultUi } from "../../../src/navigation/types";
import {
  CELL_SYMBOL,
  MULT_SYMBOL,
  attackGroups,
  defendGroups,
  isTypeId,
  matrixRows,
  nextSelection,
  parseSecond,
  secondOptions,
  toneOf,
} from "../../../src/screens/Types/types-model";

const SINGLE = [2, 0.5, 0] as const;

/** Multiplicador de referencia, lido direto das listas de TYPE_CHART (sem singleMultiplier). */
function ref(atk: TypeId, def: TypeId): number {
  const row = TYPE_CHART[atk];
  if (row[2].includes(def)) return 2;
  if (row[0.5].includes(def)) return 0.5;
  if (row[0].includes(def)) return 0;
  return 1;
}

describe("attackGroups / defendGroups (one type)", () => {
  it("derives the 3 attack and 3 defense groups of all 18 types from TYPE_CHART", () => {
    for (const x of TYPE_IDS) {
      const atk = attackGroups(x);
      expect(atk.map((g) => g.multiplier)).toEqual([2, 0.5, 0]);
      expect(atk.map((g) => g.tone)).toEqual(["adv", "dis", "zero"]);
      expect(atk.map((g) => g.titleKey)).toEqual(["types.atk2", "types.atkHalf", "types.atk0"]);
      SINGLE.forEach((m, i) => expect(atk[i]!.types).toEqual(TYPE_IDS.filter((d) => TYPE_CHART[x][m].includes(d))));

      const def = defendGroups([x]);
      expect(def.map((g) => g.multiplier)).toEqual([2, 0.5, 0]);
      expect(def.map((g) => g.tone)).toEqual(["dis", "adv", "zero"]);
      expect(def.map((g) => g.titleKey)).toEqual(["types.def2", "types.defHalf", "types.def0"]);
      SINGLE.forEach((m, i) => expect(def[i]!.types).toEqual(TYPE_IDS.filter((a) => TYPE_CHART[a][m].includes(x))));

      // nenhum x1 em grupo; grupos + x1 = os 18 sem repeticao
      const inAtk = atk.flatMap((g) => g.types);
      const ones = TYPE_IDS.filter((d) => ref(x, d) === 1);
      expect(new Set([...inAtk, ...ones]).size).toBe(18);
      expect(inAtk.length + ones.length).toBe(18);
      const inDef = def.flatMap((g) => g.types);
      const onesDef = TYPE_IDS.filter((a) => ref(a, x) === 1);
      expect(inDef.length + onesDef.length).toBe(18);
      expect(new Set([...inDef, ...onesDef]).size).toBe(18);
    }
  });

  it("keeps empty groups (RF-18) and counts them as the domain says", () => {
    expect(attackGroups("normal")[0]!.types).toEqual([]);
    expect(defendGroups(["normal"])[1]!.types).toEqual([]);
    let expected = 0;
    for (const x of TYPE_IDS) {
      for (const m of SINGLE) {
        if (TYPE_CHART[x][m].length === 0) expected++;
        if (TYPE_IDS.filter((a) => TYPE_CHART[a][m].includes(x)).length === 0) expected++;
      }
    }
    const got = TYPE_IDS.flatMap((x) => [...attackGroups(x), ...defendGroups([x])]).filter((g) => g.types.length === 0).length;
    expect(got).toBe(expected);
    expect(defendGroups([]).map((g) => g.types)).toEqual([[], [], []]);
  });

  it("matches the named examples of the PRD (fire, normal, electric, ghost, steel)", () => {
    const lists = (gs: ReturnType<typeof attackGroups>) => gs.map((g) => g.types);
    expect(lists(attackGroups("fire"))).toEqual([["grass", "ice", "bug", "steel"], ["fire", "water", "rock", "dragon"], []]);
    expect(lists(defendGroups(["fire"]))).toEqual([["water", "ground", "rock"], ["fire", "grass", "ice", "bug", "steel", "fairy"], []]);
    expect(lists(attackGroups("normal"))).toEqual([[], ["rock", "steel"], ["ghost"]]);
    expect(lists(defendGroups(["normal"]))).toEqual([["fighting"], [], ["ghost"]]);
    expect(lists(attackGroups("electric"))).toEqual([["water", "flying"], ["electric", "grass", "dragon"], ["ground"]]);
    expect(lists(defendGroups(["electric"]))).toEqual([["ground"], ["electric", "flying", "steel"], []]);
    expect(lists(attackGroups("ghost"))).toEqual([["psychic", "ghost"], ["dark"], ["normal"]]);
    expect(lists(defendGroups(["ghost"]))).toEqual([["ghost", "dark"], ["poison", "bug"], ["normal", "fighting"]]);
    expect(lists(attackGroups("steel"))).toEqual([["ice", "rock", "fairy"], ["fire", "water", "electric", "steel"], []]);
    expect(lists(defendGroups(["steel"]))).toEqual([
      ["fire", "fighting", "ground"],
      ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"],
      ["poison"],
    ]);
  });
});

describe("matrixRows", () => {
  it("builds 18 x 18 cells in TYPE_IDS order with derived multiplier, symbol and tone", () => {
    const rows = matrixRows();
    expect(rows.map((r) => r.attacker)).toEqual([...TYPE_IDS]);
    const SYM: Record<number, string> = { 2: "2", 0.5: "1/2", 0: "0", 1: "" };
    const TONE: Record<number, string> = { 2: "adv", 0.5: "dis", 0: "zero", 1: "neutral" };
    for (const row of rows) {
      expect(row.cells.map((c) => c.defender)).toEqual([...TYPE_IDS]);
      for (const c of row.cells) {
        const m = ref(row.attacker, c.defender);
        expect(c.attacker).toBe(row.attacker);
        expect(c.multiplier).toBe(m);
        expect(c.symbol).toBe(SYM[m]);
        expect(c.tone).toBe(TONE[m]);
        expect(toneOf(c.multiplier)).toBe(TONE[m]);
      }
    }
    const count = (tone: string) => rows.flatMap((r) => r.cells).filter((c) => c.tone === tone).length;
    const sum = (m: 2 | 0.5 | 0) => TYPE_IDS.reduce((n, t) => n + TYPE_CHART[t][m].length, 0);
    expect(count("adv")).toBe(sum(2));
    expect(count("dis")).toBe(sum(0.5));
    expect(count("zero")).toBe(sum(0));
    expect(count("neutral")).toBe(324 - sum(2) - sum(0.5) - sum(0));
    expect(MULT_SYMBOL).toEqual({ 4: "x4", 2: "x2", 1: "x1", 0.5: "x1/2", 0.25: "x1/4", 0: "x0" });
    expect(CELL_SYMBOL).toEqual({ 2: "2", 1: "", 0.5: "1/2", 0: "0" });
  });

  it("agrees with the groups of every type (RF-30)", () => {
    const rows = matrixRows();
    TYPE_IDS.forEach((x, i) => {
      expect(rows[i]!.cells.filter((c) => c.multiplier === 2).map((c) => c.defender)).toEqual(attackGroups(x)[0]!.types);
      const def = defendGroups([x]);
      SINGLE.forEach((m, gi) => {
        expect(rows.filter((r) => r.cells[i]!.multiplier === m).map((r) => r.attacker)).toEqual(def[gi]!.types);
      });
    });
  });
});

describe("selection rules", () => {
  it("follows the nextSelection table", () => {
    expect(nextSelection({ selected: null, second: null }, "fire")).toEqual({ selected: "fire" });
    expect(nextSelection({ selected: "fire", second: null }, "fire")).toBeNull();
    expect(nextSelection({ selected: "fire", second: null }, "water")).toEqual({ selected: "water" });
    expect(nextSelection({ selected: "water", second: "ground" }, "ground")).toEqual({ selected: "ground", second: null });
    expect(nextSelection({ selected: "water", second: "ground" }, "grass")).toEqual({ selected: "grass" });
  });

  it("offers the 17 other types as second type and parses the select value", () => {
    for (const x of TYPE_IDS) expect(secondOptions(x)).toEqual(TYPE_IDS.filter((t) => t !== x));
    expect(parseSecond("", "water")).toBeNull();
    expect(parseSecond("ground", "water")).toBe("ground");
    expect(parseSecond("water", "water")).toBeNull();
    expect(parseSecond("banana", "water")).toBeNull();
    expect(isTypeId("fire")).toBe(true);
    expect(isTypeId("banana")).toBe(false);
    expect(isTypeId(3)).toBe(false);
  });

  it("starts with the default ui state", () => {
    expect(defaultUi("types")).toEqual({ view: "byType", selected: null, tab: "attack", second: null });
  });
});

describe("[COULD] dual-type defense", () => {
  it("derives the 5 groups for all 306 ordered pairs", () => {
    const MULTS = [4, 2, 0.5, 0.25, 0] as const;
    let pairs = 0;
    for (const a of TYPE_IDS) {
      for (const b of TYPE_IDS) {
        if (a === b) continue;
        pairs++;
        const gs = defendGroups([a, b]);
        expect(gs.map((g) => g.multiplier)).toEqual([...MULTS]);
        expect(gs.map((g) => g.tone)).toEqual(["dis-strong", "dis", "adv", "adv-strong", "zero"]);
        expect(gs.map((g) => g.titleKey)).toEqual(["types.def4", "types.def2", "types.defHalf", "types.defQuarter", "types.def0"]);
        MULTS.forEach((m, i) => expect(gs[i]!.types).toEqual(TYPE_IDS.filter((atk) => ref(atk, a) * ref(atk, b) === m)));
      }
    }
    expect(pairs).toBe(306);
  });

  it("matches the RF-39 examples", () => {
    const groupOf = (defs: [TypeId, TypeId], atk: TypeId) => defendGroups(defs).find((g) => g.types.includes(atk))?.multiplier;
    expect(groupOf(["water", "ground"], "grass")).toBe(4);
    expect(groupOf(["water", "flying"], "electric")).toBe(4);
    expect(groupOf(["water", "ground"], "electric")).toBe(0);
    expect(groupOf(["rock", "steel"], "normal")).toBe(0.25);
    expect(groupOf(["grass", "steel"], "fire")).toBe(4);
  });
});

describe("page isolation and single source", () => {
  const dir = path.join(process.cwd(), "src/screens/Types");
  const files = fs.readdirSync(dir);

  it("does not import or reference the Detail screen, terms toggle or EmptyState (RF-31, RF-32)", () => {
    const allowed = [
      /^react$/,
      /^\.\/[A-Za-z-]+(\.css)?$/,
      /^\.\.\/\.\.\/components\/(ScreenRouter|SegmentedControl|TypeIcon|TypeChip|Icon)$/,
      /^\.\.\/\.\.\/data\/types$/,
      /^\.\.\/\.\.\/domain\/type-chart$/,
      /^\.\.\/\.\.\/i18n\/(useT|messages)$/,
      /^\.\.\/\.\.\/navigation\/(types|useNavigation|navigation-store)$/,
      /^\.\.\/\.\.\/state\/preferences-store$/,
    ];
    for (const f of files) {
      // comentarios do CSS citam a origem dos hex (detail.css .mult-*); so as regras contam
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const text = f.endsWith(".css") ? raw.replace(/\/\*[\s\S]*?\*\//g, "") : raw;
      expect(text, f).not.toMatch(/screens\/Detail|TypeCalculator|WeaknessPanel|EFFECT_LABEL|selectedTypes|TermsToggle|useTermsLanguage|termsLanguage|termsOverrides|EmptyState/);
      if (f.endsWith(".css")) {
        expect(text, f).not.toMatch(/\.mult-|\.weak-|\.tc-cell|\.type-calc/);
        continue;
      }
      for (const m of text.matchAll(/from "([^"]+)"|import "([^"]+)"/g)) {
        const spec = m[1] ?? m[2]!;
        expect(allowed.some((r) => r.test(spec)), `${f}: ${spec}`).toBe(true);
      }
    }
    const i18n = fs.readFileSync(path.join(process.cwd(), "src/i18n/messages/types-page.ts"), "utf8");
    expect([...i18n.matchAll(/from "([^"]+)"/g)].map((m) => m[1])).toEqual(["./types"]);
  });

  it("keeps no literal type list in the model besides HINT_KEYS (RNF-01)", () => {
    const text = fs.readFileSync(path.join(dir, "types-model.ts"), "utf8");
    const ids = TYPE_IDS.join("|");
    const literalList = new RegExp(`\\[\\s*"(${ids})"\\s*,\\s*"(${ids})"`);
    expect(text).not.toMatch(literalList);
  });
});

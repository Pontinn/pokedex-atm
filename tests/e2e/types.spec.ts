// T1.3 (type-chart): pagina Tipos de ponta a ponta, headless, sem slowMo e sem esperas fixas.
// Roda em dev (PW_DEV=1 PW_PORT=4183) e em build + preview. Navegacao so por clique real; tema por writeDoc + reload.
// Esperados derivados de TYPE_CHART (dominio) e textos do dicionario (MESSAGES), nunca da UI.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";
import { writeDoc } from "./idb-helpers";
import type { TypeId } from "../../src/data/types";
import { TYPE_CHART, TYPE_IDS } from "../../src/domain/type-chart";
import { MESSAGES } from "../../src/i18n/messages";
import { TYPE_NAMES } from "../../src/i18n/types";
import { THEME_IDS, type ThemeId } from "../../src/styles/themes";

type Lang = "pt" | "en";
const DESK = { w: 1280, h: 800 };
const PHONE = { w: 390, h: 844 };
const BG = { adv: "rgb(225, 245, 231)", dis: "rgb(255, 233, 214)", zero: "rgb(230, 231, 236)" } as const;

function msg(key: keyof typeof MESSAGES, lang: Lang = "pt", vars: Record<string, string> = {}): string {
  return MESSAGES[key][lang].replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

function ref(atk: TypeId, def: TypeId): number {
  const row = TYPE_CHART[atk];
  if (row[2].includes(def)) return 2;
  if (row[0.5].includes(def)) return 0.5;
  if (row[0].includes(def)) return 0;
  return 1;
}

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function boot(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

async function setPrefs(page: Page, theme: ThemeId, lang: Lang = "pt") {
  await writeDoc(page, "preferences", {
    schemaVersion: 1,
    theme,
    uiLanguage: lang,
    termsLanguage: lang,
    termsOverrides: {},
    soundEnabled: false,
    reduceMotion: true,
  });
  await page.reload();
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

async function start(page: Page, size: { w: number; h: number }, lang: Lang = "pt", theme: ThemeId = "classic") {
  await boot(page, size.w, size.h);
  await setPrefs(page, theme, lang);
}

async function settle(page: Page) {
  await page.mouse.move(1, 1);
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}

async function go(page: Page, screen: "types" | "dex" | "home") {
  let link = page.locator(`[data-nav="${screen}"]:visible`).first();
  if ((await link.count()) === 0) {
    await page.locator('[data-nav="more"]:visible').first().click();
    link = page.locator(`[data-nav="${screen}"]:visible`).first();
  }
  await link.click();
}

async function openTypes(page: Page) {
  await go(page, "types");
  await expect(page.locator(".types-screen")).toBeVisible();
}

const pick = (page: Page, t: TypeId) => page.locator(`[data-pick="${t}"]`).click();
const tab = (page: Page, which: "attack" | "defend", lang: Lang = "pt") =>
  page.locator(".tp-tab button", { hasText: msg(which === "attack" ? "types.tabAttack" : "types.tabDefend", lang) }).click();
const view = (page: Page, which: "byType" | "chart", lang: Lang = "pt") =>
  page.locator(".tp-view button", { hasText: msg(which === "chart" ? "types.viewChart" : "types.viewByType", lang) }).click();

function luminance(rgb: string): number {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

test.describe("navigation", () => {
  test("sidebar lists Tipos in 5th place with its own icon and opens the page", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, DESK);
    await expect(page.locator(".sidebar .nav-item")).toHaveText([
      "Início", "Pokédex", "Capturados", "Comparar", "Tipos", "Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações",
    ]);
    await openTypes(page);
    const item = page.locator('.sidebar [data-nav="types"]');
    await expect(item).toHaveClass(/active/);
    await expect(item).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".sidebar .nav-item svg.lucide-shapes")).toHaveCount(1);
    await expect(item.locator("svg")).toHaveClass(/lucide-shapes/);
    await setPrefs(page, "classic", "en");
    await expect(page.locator(".sidebar .nav-item").nth(4)).toHaveText("Types");
    expect(errors).toEqual([]);
  });

  test("phone opens Tipos from the Mais sheet with its subtitle", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, PHONE);
    await expect(page.locator(".tabbar .tab-label")).toHaveText(["Início", "Pokédex", "Capturados", "Comparar", "Mais"]);
    await page.locator('[data-nav="more"]:visible').click();
    await expect(page.locator(".more-sheet .sheet-item-label").first()).toHaveText("Tipos");
    await expect(page.locator(".more-sheet .sheet-item-sub").first()).toHaveText("Quem vence quem");
    await page.locator('.more-sheet [data-nav="types"]').click();
    await expect(page.locator(".types-screen")).toBeVisible();
    await expect(page.locator(".tabbar .tab-more")).toHaveClass(/active/);
    await setPrefs(page, "classic", "en");
    await page.locator('[data-nav="more"]:visible').click();
    await expect(page.locator(".more-sheet .sheet-item-sub").first()).toHaveText("Who beats whom");
    expect(errors).toEqual([]);
  });

  test("back restores type, tab and scroll; the path never changes", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, PHONE);
    const path0 = new URL(page.url()).pathname;
    await openTypes(page);
    await pick(page, "fire");
    await tab(page, "defend");
    // rolagem pedida: 400 px (ou o maximo). #main tem scroll-behavior: smooth (base.css:41), entao o valor so e
    // guardado depois que a rolagem chega ao alvo (settle espera animacoes, nao a rolagem suave)
    await settle(page);
    const target = await page.locator("#main").evaluate((m) => {
      const t = Math.min(400, m.scrollHeight - m.clientHeight);
      m.scrollTop = t;
      return t;
    });
    await expect.poll(() => page.locator("#main").evaluate((m) => m.scrollTop)).toBe(target);
    const saved = target;
    expect(saved).toBeGreaterThan(0);
    await go(page, "dex");
    await expect(page.locator(".dex-screen")).toBeVisible();
    await page.goBack();
    await expect(page.locator('[data-pick="fire"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".tp-tab button", { hasText: "Defendendo" })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => Math.abs((await page.locator("#main").evaluate((m) => m.scrollTop)) - saved)).toBeLessThanOrEqual(2);
    expect(new URL(page.url()).pathname).toBe(path0);
    // sem goForward: o app trata todo popstate como Voltar (history-bridge.ts; PRD rev 5.3, CA-31)
    expect(errors).toEqual([]);
  });

  test("a new entry and a reload start from scratch; nothing pushes history inside the page", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, DESK);
    await openTypes(page);
    const h0 = await page.evaluate(() => history.length);
    for (const t of ["fire", "water", "grass", "ice", "rock", "fire"] as const) await pick(page, t);
    await tab(page, "defend");
    await tab(page, "attack");
    await tab(page, "defend");
    await view(page, "chart");
    await view(page, "byType");
    await tab(page, "defend");
    expect(await page.evaluate(() => history.length)).toBe(h0);
    await go(page, "dex");
    await openTypes(page);
    await expect(page.locator('.tp-pick[aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator(".tp-instr")).toBeVisible();
    await pick(page, "fire");
    await expect(page.locator(".tp-tab button", { hasText: "Atacando" })).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
    await openTypes(page);
    await expect(page.locator('.tp-pick[aria-pressed="true"]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe("bands and colors", () => {
  test("Fire bands are derived from TYPE_CHART with the advantage colors on both tabs", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, DESK);
    await openTypes(page);
    await pick(page, "fire");
    for (const which of ["attack", "defend"] as const) {
      await tab(page, which);
      await expect(page.locator(".tp-bands")).toHaveAttribute("data-tab", which);
      const exp = ([2, 0.5, 0] as const).map((m) => TYPE_IDS.filter((t) => (which === "attack" ? ref("fire", t) : ref(t, "fire")) === m));
      const bands = page.locator(".tp-band");
      await expect(bands).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        expect(await bands.nth(i).locator("[data-type]").evaluateAll((els) => els.map((e) => e.getAttribute("data-type")))).toEqual(exp[i]);
      }
      const tones = which === "attack" ? (["adv", "dis", "zero"] as const) : (["dis", "adv", "zero"] as const);
      expect(await bands.evaluateAll((els) => els.map((e) => e.getAttribute("data-tone")))).toEqual([...tones]);
      // html.reduce-motion poe transition-duration .001s em tudo (base.css:70; transition-property padrao = all):
      // a faixa reaproveitada (key = multiplicador) troca de tom com 1 ms de transicao, entao a leitura e por polling
      await expect.poll(() => bands.evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor))).toEqual(tones.map((t) => BG[t]));
    }
    expect(errors).toEqual([]);
  });

  for (const theme of THEME_IDS) {
    test(`theme ${theme}: band text and legend reach 4.5:1 and chart tones stay fixed`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await start(page, DESK, "pt", theme);
      await openTypes(page);
      await pick(page, "steel");
      for (const which of ["attack", "defend"] as const) {
        await tab(page, which);
        await expect(page.locator(".tp-bands")).toHaveAttribute("data-tab", which);
        // toPass: a troca de aba recolore as faixas com a transicao de 1 ms do reduce-motion (base.css:70)
        await expect(async () => {
          const pairs = await page.locator(".tp-band").evaluateAll((els) =>
            els.flatMap((b) => {
              const bg = getComputedStyle(b).backgroundColor;
              return [...b.querySelectorAll("h4, .tp-band-name, .tp-none")].map((t) => [getComputedStyle(t).color, bg]);
            }),
          );
          for (const [fg, bg] of pairs) expect(contrast(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
        }).toPass();
      }
      const legend = await page.locator(".tp-legend").evaluate((p) => {
        const bg = getComputedStyle(p).backgroundColor;
        return [...p.querySelectorAll("li, .tp-legend-color > span:last-child")].map((t) => [getComputedStyle(t).color, bg]);
      });
      for (const [fg, bg] of legend) expect(contrast(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
      await view(page, "chart");
      for (const t of ["adv", "dis", "zero"] as const) {
        await expect(page.locator(`td.tp-cell[data-tone="${t}"]`).first()).toHaveCSS("background-color", BG[t]);
      }
      expect(errors).toEqual([]);
    });
  }

  test("in grayscale the symbols and the row/column highlight still carry the meaning", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, DESK);
    await openTypes(page);
    await page.evaluate(() => (document.documentElement.style.filter = "grayscale(1)"));
    await pick(page, "fire");
    const titles = await page.locator(".tp-band h4").allTextContents();
    expect(titles[0]).toContain("(x2)");
    expect(titles[1]).toContain("(x1/2)");
    expect(titles[2]).toContain("(x0)");
    await view(page, "chart");
    await expect(page.locator('tr[data-row="fire"]')).toHaveClass(/is-sel/);
    const texts = await page.locator('td.tp-cell:not([data-tone="neutral"])').allTextContents();
    for (const t of texts) expect(["2", "1/2", "0"]).toContain(t);
    const shadow = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).boxShadow);
    expect(await shadow('tr[data-row="fire"] > td')).not.toBe("none");
    expect(await shadow('td.is-col[data-def="fire"]')).not.toBe("none");
    expect(await shadow('tr[data-row="water"] > td[data-def="grass"]')).toBe("none");
    await page.locator('[data-axis="col"][data-type="water"]').click();
    await expect(page.locator('tr[data-row="water"]')).toHaveClass(/is-sel/);
    await expect.poll(() => shadow('tr[data-row="water"] > td')).not.toBe("none");
    await expect.poll(() => shadow('tr[data-row="fire"] > td[data-def="grass"]')).toBe("none");
    expect(errors).toEqual([]);
  });
});

test.describe("full chart", () => {
  for (const lang of ["pt", "en"] as const) {
    test(`cells have full accessible names and headers select the type (${lang})`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await start(page, DESK, lang);
      await openTypes(page);
      await view(page, "chart", lang);
      const name = msg("types.cellLabel", lang, { atk: TYPE_NAMES.fire[lang], def: TYPE_NAMES.grass[lang], mult: "x2" });
      await expect(page.getByRole("cell", { name })).toHaveText("2");
      await page.getByRole("button", { name: msg("types.colHeader", lang, { type: TYPE_NAMES.water[lang] }) }).click();
      await expect(page.locator('[data-axis="row"][data-type="water"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('[data-axis="col"][data-type="water"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("table.tp-matrix")).toBeVisible();
      await page.locator('tr[data-row="fire"] td[data-def="grass"]').click();
      await expect(page.locator('.tp-head[aria-pressed="true"]')).toHaveCount(2);
      await expect(page.locator('[data-axis="col"][data-type="water"]')).toHaveAttribute("aria-pressed", "true");
      expect(errors).toEqual([]);
    });
  }

  for (const size of [PHONE, { w: 360, h: 800 }]) {
    test(`at ${size.w}px only the chart scrolls and the first column stays fixed and opaque`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await start(page, size);
      await openTypes(page);
      await view(page, "chart");
      const box = page.locator(".tp-matrix-scroll");
      expect(await box.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
      const fits = await page.evaluate(() => {
        const right = document.querySelector("#main")!.getBoundingClientRect().right + 1;
        return [".types-screen", ".tp-matrix-scroll"].every((s) => document.querySelector(s)!.getBoundingClientRect().right <= right);
      });
      expect(fits).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await box.evaluate((e) => (e.scrollLeft = 200));
      const head = page.locator('tbody tr:first-child th[scope="row"]');
      const [hl, bl] = [await head.evaluate((e) => e.getBoundingClientRect().left), await box.evaluate((e) => e.getBoundingClientRect().left)];
      expect(Math.abs(hl - bl)).toBeLessThanOrEqual(5);
      const bg = await head.evaluate((e) => getComputedStyle(e).backgroundColor);
      expect(bg).toMatch(/^rgb\(/);
      const hit = await head.evaluate((e) => {
        const r = e.getBoundingClientRect();
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !!el && (el === e || e.contains(el));
      });
      expect(hit).toBe(true);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("no overlap", () => {
  for (const w of [360, 390, 1280]) {
    for (const lang of ["pt", "en"] as const) {
      test(`${w}px ${lang}: every state of the page`, async ({ page }) => {
        test.setTimeout(120_000);
        const errors = trackConsoleErrors(page);
        await start(page, { w, h: 844 }, lang);
        await openTypes(page);
        const check = async () => {
          await settle(page);
          await expectNoOverlap(page, ".types-screen");
        };
        await check();
        await pick(page, "fire");
        await check();
        await tab(page, "defend", lang);
        await check();
        await page.locator("#tp-second").selectOption("ground");
        await check();
        await page.locator("#tp-second").selectOption("");
        await view(page, "chart", lang);
        await page.locator(".tp-matrix-scroll").evaluate((e) => (e.scrollLeft = 0));
        await check();
        await go(page, "dex");
        await openTypes(page);
        await view(page, "chart", lang);
        await check();
        expect(errors).toEqual([]);
      });
    }
  }
});

test.describe("keyboard", () => {
  test("every stop shows a 2px focus ring and the controls work without the mouse", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, DESK);
    await openTypes(page);
    const ring = async () => {
      const r = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement;
        const s = getComputedStyle(e);
        return { fv: e.matches(":focus-visible"), style: s.outlineStyle, width: s.outlineWidth };
      });
      expect(r.fv).toBe(true);
      expect(r.style).not.toBe("none");
      expect(r.width).toBe("2px");
    };
    const tabUntil = async (test: () => Promise<boolean>) => {
      for (let i = 0; i < 80; i++) {
        await page.keyboard.press("Tab");
        if (await test()) return;
      }
      throw new Error("focus target not reached in 80 Tab presses");
    };
    const focused = (sel: string) => () => page.evaluate((s) => document.activeElement?.matches(s) ?? false, sel);

    await page.locator(".tp-view button").first().focus();
    await tabUntil(focused(".tp-view button:nth-child(2)"));
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.activeElement!).outlineWidth)).toBe("2px");
    await ring();
    await page.keyboard.press("Enter");
    await expect(page.locator("table.tp-matrix")).toBeVisible();
    await tabUntil(focused('[data-axis="col"][data-type="water"]'));
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.activeElement!).outlineWidth)).toBe("2px");
    await ring();
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-axis="col"][data-type="water"]')).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Shift+Tab");
    for (let i = 0; i < 80 && !(await focused(".tp-view button:first-child")()); i++) await page.keyboard.press("Shift+Tab");
    await ring();
    await page.keyboard.press("Enter");
    await expect(page.locator(".tp-grid")).toBeVisible();
    await tabUntil(focused('[data-pick="fire"]'));
    await ring();
    await page.keyboard.press("Space");
    await expect(page.locator('[data-pick="fire"]')).toHaveAttribute("aria-pressed", "true");
    await tabUntil(focused(".tp-tab button:nth-child(2)"));
    await ring();
    await page.keyboard.press("Enter");
    await expect(page.locator(".tp-tab button:nth-child(2)")).toHaveAttribute("aria-pressed", "true");
    await tabUntil(focused("#tp-second"));
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.activeElement!).outlineWidth)).toBe("2px");
    await ring();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#tp-second")).not.toHaveValue("");
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#tp-second")).toHaveValue("");
    await expect(page.locator(".tp-view button:first-child")).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  });
});

test.describe("performance", () => {
  test("switching views and picking types has no long task over 200ms; the chart is unmounted on By type", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, DESK);
    await openTypes(page);
    await page.evaluate(() => {
      const w = window as unknown as { __longTasks: number[] };
      w.__longTasks = [];
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) w.__longTasks.push(e.duration);
        }).observe({ type: "longtask", buffered: true });
      } catch {
        // navegador sem suporte a "longtask": fica [] e o teste so confere o resto
      }
    });
    await view(page, "chart");
    for (const t of ["fire", "water", "grass"] as const) await page.locator(`[data-axis="row"][data-type="${t}"]`).click();
    await view(page, "byType");
    await expect(page.locator("table.tp-matrix")).toHaveCount(0);
    for (const t of ["ice", "rock", "dark"] as const) await pick(page, t);
    const tasks = await page.evaluate(() => (window as unknown as { __longTasks: number[] }).__longTasks);
    for (const d of tasks) expect(d).toBeLessThanOrEqual(200);
    expect(errors).toEqual([]);
  });
});

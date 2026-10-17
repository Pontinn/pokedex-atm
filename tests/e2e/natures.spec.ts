// natures (quick): pagina Naturezas de ponta a ponta, headless, sem slowMo e sem esperas fixas.
// Roda em dev (PW_DEV=1 PW_PORT=4183) e em build + preview. Navegacao so por clique real; tema por writeDoc + reload.
// Esperados derivados de NATURES (dominio) e textos do dicionario (MESSAGES), nunca da UI.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";
import { writeDoc } from "./idb-helpers";
import { NATURES } from "../../src/domain/natures";
import { MESSAGES } from "../../src/i18n/messages";
import { THEME_IDS, type ThemeId } from "../../src/styles/themes";

type Lang = "pt" | "en";
const DESK = { w: 1280, h: 800 };
const PHONE = { w: 390, h: 844 };
const BG = { adv: "rgb(225, 245, 231)", dis: "rgb(255, 233, 214)", zero: "rgb(230, 231, 236)" } as const;

function msg(key: keyof typeof MESSAGES, lang: Lang = "pt", vars: Record<string, string> = {}): string {
  return MESSAGES[key][lang].replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
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
  await page.setViewportSize({ width: size.w, height: size.h });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
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

async function go(page: Page, screen: "natures" | "dex") {
  let link = page.locator(`[data-nav="${screen}"]:visible`).first();
  if ((await link.count()) === 0) {
    await page.locator('[data-nav="more"]:visible').first().click();
    link = page.locator(`[data-nav="${screen}"]:visible`).first();
  }
  await link.click();
}

async function openNatures(page: Page) {
  await go(page, "natures");
  await expect(page.locator(".natures-screen")).toBeVisible();
}

const view = (page: Page, which: "table" | "byStat", lang: Lang = "pt") =>
  page.locator(".nt-view button", { hasText: msg(which === "table" ? "natures.viewTable" : "natures.viewByStat", lang) }).click();

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
  test("sidebar lists Naturezas right after Tipos with its own icon and opens the page", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, DESK);
    await expect(page.locator(".sidebar .nav-item")).toHaveText([
      "Início", "Pokédex", "Capturados", "Comparar", "Tipos", "Naturezas", "Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações",
    ]);
    await openNatures(page);
    const item = page.locator('.sidebar [data-nav="natures"]');
    await expect(item).toHaveClass(/active/);
    await expect(item).toHaveAttribute("aria-current", "page");
    await expect(item.locator("svg")).toHaveClass(/lucide-smile/);
    await expect(page.locator(".natures-screen h2")).toHaveText(msg("nav.natures"));
    expect(errors).toEqual([]);
  });

  test("phone opens Naturezas from the Mais sheet; back restores view, stat and nature", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, PHONE);
    await expect(page.locator(".tabbar .tab-label")).toHaveText(["Início", "Pokédex", "Capturados", "Comparar", "Mais"]);
    await page.locator('[data-nav="more"]:visible').click();
    await expect(page.locator('.more-sheet [data-nav="natures"] .sheet-item-sub')).toHaveText(msg("nav.naturesSub"));
    await page.locator('.more-sheet [data-nav="natures"]').click();
    await expect(page.locator(".natures-screen")).toBeVisible();
    await expect(page.locator(".tabbar .tab-more")).toHaveClass(/active/);
    await view(page, "byStat");
    await page.locator('[data-stat="defence"]').click();
    await page.locator('[data-band="raise"] [data-nature="bold"]').click();
    await go(page, "dex");
    await expect(page.locator(".dex-screen")).toBeVisible();
    await page.goBack();
    await expect(page.locator(".nt-view button", { hasText: msg("natures.viewByStat") })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-stat="defence"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('.nt-focus[data-focus="bold"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("table and focus", () => {
  for (const lang of ["pt", "en"] as const) {
    test(`row = raises, column = lowers; picking a cell shows the focus (${lang})`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await start(page, DESK, lang);
      await openNatures(page);
      await expect(page.locator(".nt-table [data-nature]")).toHaveCount(25);
      await expect(page.locator('.nt-table [data-neutral="true"]')).toHaveCount(5);
      const adamant = NATURES.find((n) => n.id === "adamant")!;
      const cell = page.locator('tr[data-up="attack"] td[data-down="specialAttack"] [data-nature]');
      await expect(cell).toHaveAttribute("data-nature", "adamant");
      await expect(cell).toHaveText(adamant.name[lang]);
      await cell.click();
      await expect(cell).toHaveAttribute("aria-pressed", "true");
      const focus = page.locator('.nt-focus[data-focus="adamant"]');
      await expect(focus.locator("h3")).toHaveText(adamant.name[lang]);
      await expect(focus.locator(".nt-focus-en")).toHaveCount(lang === "pt" ? 1 : 0);
      await expect(focus.locator('[data-chip="up"]')).toHaveText(`+10% ${msg("stat.atk", lang)}`);
      await expect(focus.locator('[data-chip="down"]')).toHaveText(`-10% ${msg("stat.spa", lang)}`);
      await expect(focus.locator('[data-chip="up"]')).toHaveCSS("background-color", BG.adv);
      await expect(focus.locator('[data-chip="down"]')).toHaveCSS("background-color", BG.dis);
      await page.locator('[data-nature="serious"]').click();
      await expect(page.locator('.nt-focus [data-chip="neutral"]')).toHaveText(msg("natures.chipNeutral", lang));
      await expect(page.locator('.nt-table [aria-pressed="true"]')).toHaveCount(1);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("by stat", () => {
  test("Speed shows the 4 natures that raise it, the 4 that lower it and the 5 neutral ones", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await start(page, DESK);
    await openNatures(page);
    await view(page, "byStat");
    await expect(page.locator(".nt-table")).toHaveCount(0);
    await page.locator('[data-stat="speed"]').click();
    const ids = (band: string) => page.locator(`[data-band="${band}"] [data-nature]`).evaluateAll((els) => els.map((e) => e.getAttribute("data-nature")).sort());
    expect(await ids("raise")).toEqual(NATURES.filter((n) => n.up === "speed").map((n) => n.id).sort());
    expect(await ids("lower")).toEqual(NATURES.filter((n) => n.down === "speed").map((n) => n.id).sort());
    expect(await ids("neutral")).toEqual(NATURES.filter((n) => n.up === null).map((n) => n.id).sort());
    await expect(page.locator('[data-band="raise"] h4')).toHaveText(msg("natures.raise", "pt", { stat: msg("stat.spe") }));
    await expect(page.locator('[data-band="raise"]')).toHaveCSS("background-color", BG.adv);
    await expect(page.locator('[data-band="lower"]')).toHaveCSS("background-color", BG.dis);
    await expect(page.locator('[data-band="neutral"]')).toHaveCSS("background-color", BG.zero);
    await page.locator('[data-band="lower"] [data-nature="quiet"]').click();
    await expect(page.locator('.nt-focus[data-focus="quiet"] [data-chip="down"]')).toHaveText(`-10% ${msg("stat.spe")}`);
    await view(page, "table");
    await expect(page.locator('.nt-table [data-nature="quiet"]')).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  });
});

test.describe("themes", () => {
  for (const theme of THEME_IDS) {
    test(`theme ${theme}: tones stay fixed and band titles reach 4.5:1`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await start(page, DESK, "pt", theme);
      await openNatures(page);
      await expect(page.locator(".nt-row-head").first()).toHaveCSS("background-color", BG.adv);
      await expect(page.locator(".nt-col-head").first()).toHaveCSS("background-color", BG.dis);
      await expect(page.locator('[data-neutral="true"]').first()).toHaveCSS("background-color", BG.zero);
      await view(page, "byStat");
      await page.locator('[data-stat="attack"]').click();
      await expect(async () => {
        const pairs = await page.locator(".nt-band").evaluateAll((els) =>
          els.map((b) => [getComputedStyle(b.querySelector("h4")!).color, getComputedStyle(b).backgroundColor]),
        );
        expect(pairs).toHaveLength(3);
        for (const [fg, bg] of pairs) expect(contrast(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
      }).toPass();
      expect(errors).toEqual([]);
    });
  }
});

test.describe("no overlap", () => {
  for (const w of [360, 1280]) {
    for (const lang of ["pt", "en"] as const) {
      test(`${w}px ${lang}: both views with a nature selected`, async ({ page }) => {
        const errors = trackConsoleErrors(page);
        await start(page, { w, h: 844 }, lang);
        await openNatures(page);
        const check = async () => {
          await settle(page);
          await expectNoOverlap(page, ".natures-screen");
        };
        await check();
        await page.locator('[data-nature="timid"]').click();
        await page.locator(".nt-table-scroll").evaluate((e) => (e.scrollLeft = 0));
        await check();
        await view(page, "byStat", lang);
        await check();
        await page.locator('[data-stat="specialDefence"]').click();
        await check();
        if (w === 360) {
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        expect(errors).toEqual([]);
      });
    }
  }
});

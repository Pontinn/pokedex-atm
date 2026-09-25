// F6.2: Capturados com o dataset REAL, headless, sem slowMo, sem esperas fixas. Dados semeados pela propria store
// (mesma instancia do app, modo dev). Opcional CAPTURED_SHOTS_DIR=<pasta> grava desktop/mobile para conferencia.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";
import { writeDoc } from "./idb-helpers";

const SHOTS = process.env.CAPTURED_SHOTS_DIR;
const DAY = 86_400_000;
const BASE = Date.UTC(2026, 8, 20, 12);
// dex -> dias antes de BASE (0 = mais recente)
const SEED: [number, number][] = [
  [448, 0],
  [94, 8],
  [5, 12],
  [133, 15],
  [4, 18],
  [25, 20],
  [1, 21],
];

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function boot(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

// Escreve direto no IndexedDB (chave "captured") e avisa a store via "pontindex:data-changed": funciona em dev e
// em build+preview (a captura por data arbitraria no passado nao da pra fazer pela UI, so "Capturei" na hora).
async function seed(page: Page) {
  const entries: Record<string, { capturedAt: number }> = {};
  for (const [dex, ago] of SEED) entries[String(dex)] = { capturedAt: BASE - ago * DAY };
  await writeDoc(page, "captured", { schemaVersion: 1, entries });
}

async function goCaptured(page: Page) {
  await page.locator('[data-nav="captured"]:visible').first().click();
  await expect(page.locator(".captured-screen")).toBeVisible();
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const toggle = page.locator(".tgl-lang:visible").first();
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

function dexOrder(page: Page) {
  return page.locator(".captured-results .pcard").evaluateAll((els) => els.map((e) => Number((e as HTMLElement).dataset.dex)));
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/") || url.pathname.startsWith("/assets/cries/"), (route) =>
    route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }),
  );
});

test.describe("F6.2 captured list", () => {
  test("empty profile: 0 of 1.027 and empty state with a link to the Dex", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await goCaptured(page);
    await expect(page.locator("#captured-summary .summary-big")).toHaveText("0 de 1.027");
    await expect(page.locator(".captured-results .ob-none")).toContainText("Nenhum Pokémon capturado ainda.");
    await page.locator(".captured-open-dex").click();
    await expect(page.locator(".dex-screen")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("counter, most recent first with dates, reload keeps the list, unmark with confirmation", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await seed(page);
    await goCaptured(page);
    await expect(page.locator("#captured-summary .summary-big")).toHaveText("7 de 1.027");
    await expect(page.locator("#captured-summary .summary-pct")).toHaveText("0,7% da Pontindex");
    await expect.poll(() => dexOrder(page)).toEqual(SEED.map(([d]) => d));
    const first = page.locator(".pcard-cell").filter({ has: page.locator(".pcard[data-dex='448']") });
    const date = new Date(BASE);
    const dd = String(date.getDate()).padStart(2, "0");
    await expect(first.locator(".caught-date")).toHaveText(`Capturado em ${dd}/09/2026`);
    if (SHOTS) {
      // o dev server pode recarregar modulos (HMR) com outros agentes editando: espera a tampa sumir antes do print
      await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
      await page.screenshot({ path: `${SHOTS}/desktop-captured-list.png` });
    }
    await page.reload();
    await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
    await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
    await goCaptured(page);
    await expect.poll(() => dexOrder(page)).toEqual(SEED.map(([d]) => d));
    await page.locator("[data-unmark='94']").click();
    await expect(page.locator(".modal")).toContainText("Gengar");
    await page.locator("#btn-unmark-confirm").click();
    await expect(page.locator("#captured-summary .summary-big")).toHaveText("6 de 1.027");
    await expect(page.locator(".captured-results .pcard[data-dex='94']")).toHaveCount(0);
    await setLanguage(page, "en");
    await expect(page.locator("#captured-summary .summary-big")).toHaveText("6 of 1,027");
    await expect(first.locator(".caught-date")).toHaveText(`Caught on 2026-09-${dd}`);
    await page.locator(".captured-results .pcard[data-dex='448']").click();
    await expect(page.locator(".detail-screen[data-dex='448']")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("search PT/EN combined with the tabs, empty result shows the text, restored after Back", async ({ page }) => {
    await boot(page);
    await seed(page);
    await goCaptured(page);
    const search = page.locator("#captured-search");
    await search.fill("char");
    await expect.poll(() => dexOrder(page)).toEqual([5, 4]);
    await search.fill("pantano");
    await expect(page.locator(".captured-results .ob-none")).toContainText('"pantano"');
    await page.locator(".captured-tabs button").nth(1).click();
    await expect.poll(() => dexOrder(page)).toEqual([195]);
    await search.fill("char");
    await expect.poll(async () => (await dexOrder(page)).slice(0, 2)).toEqual([6, 390]);
    expect(await dexOrder(page)).not.toContain(5);
    await search.fill("25");
    await expect(page.locator(".captured-results .ob-none")).toContainText('"25"');
    await search.fill("26");
    await expect.poll(() => dexOrder(page)).toEqual([26]);
    await page.locator(".captured-results .pcard[data-dex='26']").click();
    await expect(page.locator(".detail-screen[data-dex='26']")).toBeVisible();
    await page.goBack();
    await expect(page.locator("#captured-search")).toHaveValue("26");
    await expect(page.locator(".captured-tabs button").nth(1)).toHaveClass(/active/);
    await expect.poll(() => dexOrder(page)).toEqual([26]);
  });

  for (const width of [360, 390, 1280]) {
    test(`captured screen without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 900);
      await seed(page);
      await goCaptured(page);
      await expect(page.locator(".captured-results .pcard").first()).toBeVisible();
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await page.mouse.move(1, 1);
        await page.evaluate(() =>
          Promise.all(
            document
              .getAnimations()
              .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
              .map((a) => a.finished.catch(() => undefined)),
          ),
        );
        await expectNoOverlap(page, page.locator(".captured-screen"));
      }
      if (SHOTS && width === 390) await page.screenshot({ path: `${SHOTS}/mobile-captured.png` });
    });
  }
});

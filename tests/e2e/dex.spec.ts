// F3: Pokedex com o dataset REAL publicado (public/data/current.json), headless, sem slowMo, sem esperas fixas.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

const SHOTS = process.env.DEX_SHOTS_DIR;

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function openDex(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#btn-open-dex")).toBeVisible({ timeout: 30_000 });
  await page.locator("#btn-open-dex").click();
  await expect(page.locator(".dex-screen .pcard").first()).toBeVisible({ timeout: 30_000 });
  // o clique em "Abrir Pokedex" deixa o mouse sobre a grade: tira o hover (escala da imagem) das checagens
  await page.mouse.move(1, 1);
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const toggle = page.locator(".tgl-lang:visible").first();
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

/** Rola #main sem o scroll suave do CSS (instantaneo). */
async function scrollMain(page: Page, y: number | "end") {
  await page.locator("#main").evaluate((m, top) => m.scrollTo({ top: top === "end" ? m.scrollHeight : top, behavior: "instant" }), y);
}

/** Rola a grade virtualizada ate o card existir no DOM (passos de 1 tela, sem esperas fixas). */
async function scrollToCard(page: Page, dex: number) {
  const card = page.locator(`.pcard[data-dex='${dex}']`);
  await expect
    .poll(async () => {
      if ((await card.count()) > 0) return true;
      await page.locator("#main").evaluate((m) => m.scrollBy({ top: m.clientHeight, behavior: "instant" }));
      return false;
    }, { timeout: 60_000, intervals: [50] })
    .toBe(true);
  await card.scrollIntoViewIfNeeded();
  return card;
}

/** Espera as animacoes finitas (cardIn) terminarem antes de um screenshot de conferencia. */
async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test.describe("F3.1 virtualized grid", () => {
  test("1027 results with at most 60 cards in the DOM, also after scrolling", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openDex(page);
    await expect(page.locator("#dex-count")).toHaveText("1027");
    expect(await page.locator(".pcard").count()).toBeLessThanOrEqual(60);
    const first = page.locator(".pcard").first();
    await expect(first).toHaveAttribute("data-dex", "1");
    await expect(first.locator(".dex-num")).toHaveText("#0001");
    await expect(first).toHaveClass(/g-grass/);
    await scrollMain(page, 20_000);
    await expect(page.locator(".pcard").first()).not.toHaveAttribute("data-dex", "1");
    expect(await page.locator(".pcard").count()).toBeLessThanOrEqual(60);
    await scrollMain(page, "end");
    await expect.poll(async () => {
      await scrollMain(page, "end");
      return page.locator(".pcard[data-dex='9902']").count();
    }).toBe(1);
    expect(await page.locator(".pcard").count()).toBeLessThanOrEqual(60);
    if (SHOTS) {
      await scrollMain(page, 0);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/desktop-dex-grid.png` });
    }
    expect(errors).toEqual([]);
  });

  test("legendary card has the special seal and rarity; clicking a card opens the detail", async ({ page }) => {
    await openDex(page);
    const mewtwo = await scrollToCard(page, 150);
    await expect(mewtwo).toHaveClass(/rar-legendary/);
    await expect(mewtwo.locator(".badge-legendary")).toBeVisible();
    await mewtwo.click();
    await expect(page.locator("[data-screen='detail']")).toBeVisible();
  });

  for (const width of [360, 390]) {
    test(`badges never wrap their own text at ${width}px (PT and EN)`, async ({ page }) => {
      await openDex(page, width, 800);
      await expect(page.locator(".poke-grid-virtual")).toHaveAttribute("data-columns", "2");
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        for (const scroll of [0, 4_000]) {
          await scrollMain(page, scroll);
          await expect(page.locator(".pcard").first()).toBeVisible();
          const wrapped = await page.locator(".pcard .badge").evaluateAll((els) =>
            els.filter((el) => el.getClientRects().length > 1 || el.getBoundingClientRect().height > 26).map((el) => el.textContent),
          );
          expect(wrapped).toEqual([]);
          await settle(page);
          await expectNoOverlap(page, page.locator(".dex-screen"));
        }
      }
      if (SHOTS && width === 390) {
        await scrollMain(page, 0);
        await settle(page);
        await page.screenshot({ path: `${SHOTS}/mobile-dex-grid.png` });
      }
    });
  }

  test("no overlap at 1280px in PT and EN", async ({ page }) => {
    await openDex(page);
    for (const lang of ["pt", "en"] as const) {
      await setLanguage(page, lang);
      await settle(page);
      await expectNoOverlap(page, page.locator(".dex-screen"));
    }
  });
});

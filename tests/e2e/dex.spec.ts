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

const cardDexes = (page: Page) => page.locator(".pcard").evaluateAll((els) => els.map((el) => Number(el.getAttribute("data-dex"))));

async function filterText(page: Page, q: string) {
  await page.locator("#dex-search").fill(q);
}

test.describe("F3.2 combinable filters and search", () => {
  test("Fire + gen1 -> only gen 1 Fire; removing a filter does not remount the screen", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openDex(page);
    const mountId = await page.locator(".dex-screen").getAttribute("data-mount-id");
    await page.locator("[data-ftype='fire']").click();
    await expect(page.locator("[data-ftype='fire']")).toHaveClass(/\bon\b/);
    await page.locator("#f-gen").selectOption("gen1");
    await expect(page.locator("#dex-count")).toHaveText("12");
    const dexes = await cardDexes(page);
    expect(dexes).toEqual([4, 5, 6, 37, 38, 58, 59, 77, 78, 126, 136, 146]);
    for (const card of await page.locator(".pcard").all()) await expect(card.locator(".chip.t-fire")).toHaveCount(1);
    await page.locator("[data-ftype='fire']").click();
    await expect(page.locator("#dex-count")).not.toHaveText("12");
    await expect(page.locator(".dex-screen")).toHaveAttribute("data-mount-id", mountId ?? "");
    expect(errors).toEqual([]);
  });

  test("evolution 'item' keeps only species that evolve with an item", async ({ page }) => {
    await openDex(page);
    await page.locator("#f-evo").selectOption("item");
    await expect(page.locator(".pcard[data-dex='25']")).toBeVisible();
    await expect(page.locator(".pcard[data-dex='1']")).toHaveCount(0);
    // le o species-index publicado direto (fetch), sem depender de "/src/..." (so existe no dev server): mesmo
    // arquivo estatico que o app carrega, funciona igual em dev e em build+preview.
    const ok = await page.evaluate(async (dexes) => {
      const current = (await (await fetch("/data/current.json")).json()) as { datasetVersion: string };
      const index = (await (await fetch(`/data/${current.datasetVersion}/species-index.json`)).json()) as {
        dex: number;
        evolutionMethods: string[];
      }[];
      return dexes.every((d) => index.find((s) => s.dex === d)?.evolutionMethods.includes("item"));
    }, await cardDexes(page));
    expect(ok).toBe(true);
  });

  test("search: 'char' + Fire, '25', 'pantano', empty state with the text", async ({ page }) => {
    await openDex(page);
    await page.locator("[data-ftype='fire']").click();
    await filterText(page, "char");
    // substring PT/EN, igual a Home: Charmander, Charmeleon, Charizard, Chimchar, Charcadet (todos Fogo)
    await expect(page.locator("#dex-count")).toHaveText("5");
    expect(await cardDexes(page)).toEqual([4, 5, 6, 390, 935]);
    await page.locator("[data-ftype='fire']").click();
    await filterText(page, "25");
    await expect(page.locator("#dex-count")).toHaveText("1");
    await expect(page.locator(".pcard .pcard-name")).toHaveText("Pikachu");
    await filterText(page, "pantano");
    await expect(page.locator(".pcard")).toHaveCount(1);
    await expect(page.locator(".pcard")).toHaveAttribute("data-dex", "195");
    await filterText(page, "zzzzqq");
    await expect(page.locator(".dex-screen .ob-none")).toContainText("zzzzqq");
    await page.locator(".list-search-clear").click();
    await expect(page.locator("#dex-count")).toHaveText("1027");
  });

  test("text, filters and scroll are restored after Back from the detail", async ({ page }) => {
    await openDex(page);
    await filterText(page, "a");
    await expect(page.locator("#dex-count")).not.toHaveText("1027");
    const afterText = (await page.locator("#dex-count").textContent()) ?? "";
    await page.locator("[data-ftype='water']").click();
    await expect(page.locator("#dex-count")).not.toHaveText(afterText);
    const count = await page.locator("#dex-count").textContent();
    await scrollMain(page, 1_500);
    await expect.poll(() => page.locator("#main").evaluate((m) => m.scrollTop)).toBe(1_500);
    // dispatchEvent: um clique normal rolaria ate o card (linha de overscan) e mudaria o scroll salvo
    await page.locator(".pcard").nth(4).dispatchEvent("click");
    await expect(page.locator("[data-screen='detail']")).toBeVisible();
    await page.goBack();
    await expect(page.locator("#dex-search")).toHaveValue("a");
    await expect(page.locator("[data-ftype='water']")).toHaveClass(/\bon\b/);
    await expect(page.locator("#dex-count")).toHaveText(count ?? "");
    await expect.poll(() => page.locator("#main").evaluate((m) => m.scrollTop)).toBeGreaterThanOrEqual(1_498);
    expect(Math.abs((await page.locator("#main").evaluate((m) => m.scrollTop)) - 1_500)).toBeLessThanOrEqual(2);
  });

  for (const width of [360, 390, 1280]) {
    test(`search bar and filters without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await openDex(page, width, 800);
      await filterText(page, "char");
      await expect(page.locator(".list-search-clear")).toBeVisible();
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await settle(page);
        await expectNoOverlap(page, page.locator(".list-search"));
        await expectNoOverlap(page, page.locator("#filters"));
      }
      if (SHOTS && width !== 360) {
        await filterText(page, "");
        await settle(page);
        await page.screenshot({ path: `${SHOTS}/dex-filters-${width}.png` });
      }
    });
  }
});

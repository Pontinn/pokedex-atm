// T1 (SPEC, matriz e2e): responsividade 360/390px (badges/chips) + comparacao visual por tema.
// Mode-agnostic (navegacao real de UI + IndexedDB direto via idb-helpers.ts): roda em dev e em build+preview.
//
// Decisao 10 de F1.4 (HANDOFF_frontend.md): pixel-diff contra .forge/in-progress/pontindex/ui-refs/ (screenshots
// do PROTOTIPO) sempre falharia (fontes/CDN diferentes do app publicado). Este arquivo usa baselines do PROPRIO
// app via `toHaveScreenshot`
// (tolerancia 2%: maxDiffPixelRatio 0.02), geradas em modo dev (PW_DEV=1) e commitadas em
// tests/e2e/responsive.spec.ts-snapshots/. Regerar com `--update-snapshots` se um ajuste visual intencional
// mudar Home/ficha nos 7 temas.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";
import { writeDoc } from "./idb-helpers";
import { THEME_IDS, type ThemeId } from "../../src/styles/themes";

const WIDTHS = [360, 390] as const;

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function boot(page: Page, width: number, height = 844) {
  await page.setViewportSize({ width, height });
  await page.route((url) => url.pathname.startsWith("/assets/sfx/") || url.pathname.startsWith("/assets/cries/"), (route) =>
    route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }),
  );
  await page.goto("/");
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

async function go(page: Page, screen: "home" | "dex" | "captured" | "items" | "balls") {
  let link = page.locator(`[data-nav="${screen}"]:visible`).first();
  if ((await link.count()) === 0) {
    await page.locator('[data-nav="more"]:visible').first().click();
    link = page.locator(`[data-nav="${screen}"]:visible`).first();
  }
  await link.click();
}

async function openDetail(page: Page, dex: number) {
  if (!(await page.locator(".home-screen").isVisible().catch(() => false))) {
    await go(page, "home");
    await expect(page.locator(".home-screen")).toBeVisible();
  }
  await page.locator("#search-input").fill(String(dex));
  const item = page.locator(`.search-dd .dd-item[data-dex='${dex}']`);
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator(`.detail-screen[data-dex='${dex}']`)).toBeVisible();
}

// Semeia time/historico/capturados direto no IndexedDB (mesmo schema de src/storage/types.ts, ver
// tests/e2e/idb-helpers.ts) para que badges (raridade/lendario) e chips (tipo) apareçam de verdade em Home e
// Capturados sem depender de import("/src/...").
async function seedData(page: Page) {
  await writeDoc(page, "team", { schemaVersion: 1, slots: [6, 150, 94, null, null, null] });
  await writeDoc(page, "history", {
    schemaVersion: 1,
    entries: [
      { dex: 6, viewedAt: 3000 },
      { dex: 150, viewedAt: 2000 },
      { dex: 94, viewedAt: 1000 },
    ],
  });
  await writeDoc(page, "captured", {
    schemaVersion: 1,
    entries: { "6": { capturedAt: 1000 }, "150": { capturedAt: 2000 }, "94": { capturedAt: 3000 } },
  });
}

async function setTheme(page: Page, theme: ThemeId) {
  await writeDoc(page, "preferences", {
    schemaVersion: 1,
    theme,
    uiLanguage: "pt",
    termsLanguage: "pt",
    termsOverrides: {},
    soundEnabled: false,
    reduceMotion: true,
  });
}

/** Espera as animacoes finitas ainda em curso (transicoes de entrada) e tira o mouse da area, para print estavel. */
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

/** Nenhum `.badge` deve ficar com o proprio texto cortado (a linha de selos PODE quebrar em mais de uma linha;
 *  cada selo, individualmente, e `white-space: nowrap` por CSS e nunca deve "vazar" do seu proprio retangulo). */
async function expectBadgesIntact(page: Page, root: string) {
  const bad = await page.locator(`${root} .badge`).evaluateAll((els) =>
    els
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => ({ text: el.textContent, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth })),
  );
  expect(bad, `badges com texto cortado em ${root}`).toEqual([]);
}

/**
 * Nenhum `.chip` deve ultrapassar a largura da viewport (vazamento horizontal), EXCETO dentro de uma faixa com
 * scroll horizontal proposital (ex. `.history-row` no mobile, `overflow-x: auto/scroll` por CSS, `app.mobile
 * .history-row`, home.css): ali o cartao seguinte fica de proposito fora da viewport ate o usuario rolar.
 */
async function expectChipsInViewport(page: Page, root: string) {
  const vw = await page.evaluate(() => window.innerWidth);
  const boxes = await page.locator(`${root} .chip`).evaluateAll((els) =>
    els
      .filter((el) => {
        for (let n: Element | null = el; n; n = n.parentElement) {
          const ox = getComputedStyle(n).overflowX;
          if (ox === "auto" || ox === "scroll") return false;
        }
        return true;
      })
      .map((el) => el.getBoundingClientRect().toJSON()),
  );
  for (const b of boxes) {
    expect(b.left, `chip comeca antes da viewport em ${root}`).toBeGreaterThanOrEqual(-1);
    expect(b.right, `chip vaza a direita da viewport (${vw}px) em ${root}`).toBeLessThanOrEqual(vw + 1);
  }
}

test.describe("T1 responsive: badges/chips at 360/390px", () => {
  for (const width of WIDTHS) {
    test(`Home: badges intact, no overlap, chips in viewport (${width}px)`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width);
      await seedData(page);
      await expect(page.locator(".team-slots .slot.filled")).toHaveCount(3);
      await expectNoOverlap(page, ".home-screen");
      await expectBadgesIntact(page, ".home-screen");
      await expectChipsInViewport(page, ".home-screen");
      expect(errors).toEqual([]);
    });

    test(`Dex: badges intact, no overlap, chips in viewport (${width}px)`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width);
      await go(page, "dex");
      await expect(page.locator(".dex-screen .pcard").first()).toBeVisible({ timeout: 30_000 });
      await expectNoOverlap(page, ".dex-screen");
      await expectBadgesIntact(page, ".dex-screen");
      await expectChipsInViewport(page, ".dex-screen");
      expect(errors).toEqual([]);
    });

    test(`Detail (Mewtwo, legendary badge): badges intact, no overlap, chips in viewport (${width}px)`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width);
      await openDetail(page, 150);
      await expectNoOverlap(page, ".detail-screen");
      await expectBadgesIntact(page, ".detail-screen");
      await expectChipsInViewport(page, ".detail-screen");
      expect(errors).toEqual([]);
    });

    test(`Captured: badges intact, no overlap, chips in viewport (${width}px)`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width);
      await seedData(page);
      await go(page, "captured");
      await expect(page.locator(".captured-results .pcard").first()).toBeVisible({ timeout: 30_000 });
      await expectNoOverlap(page, ".captured-screen");
      await expectBadgesIntact(page, ".captured-screen");
      await expectChipsInViewport(page, ".captured-screen");
      expect(errors).toEqual([]);
    });
  }
});

test.describe("T1 responsive: 7 themes x Home/ficha (baseline do proprio app, 2% de tolerancia)", () => {
  for (const theme of THEME_IDS) {
    test(`theme ${theme}: Home and Charizard detail screenshots`, async ({ page }) => {
      await boot(page, 1280, 800);
      await setTheme(page, theme);
      await page.reload();
      await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await settle(page);
      await expect(page).toHaveScreenshot(`home-${theme}.png`, { maxDiffPixelRatio: 0.02, fullPage: true });

      await openDetail(page, 6);
      await settle(page);
      await expect(page).toHaveScreenshot(`detail-charizard-${theme}.png`, {
        maxDiffPixelRatio: 0.02,
        fullPage: true,
        mask: [page.locator(".hero-art .sparkles"), page.locator(".sheen")],
      });
    });
  }
});

/**
 * Barras de abas/segmentos/chips com scroll horizontal nunca podem rolar na VERTICAL (bug do Pontin 2026-09-26:
 * `.tabs` com `overflow-x: auto` + botoes com `margin-bottom` negativo = 1.5px de overflow e barra de rolagem
 * vertical nas categorias de Itens). Mede toda faixa visivel do seletor.
 */
async function expectNoVerticalScroll(page: Page, selector: string) {
  const els = page.locator(`${selector}:visible`);
  await expect(els.first()).toBeVisible();
  const bad = await els.evaluateAll((list) =>
    list
      .filter((el) => el.scrollHeight > el.clientHeight || getComputedStyle(el).overflowY === "scroll")
      .map((el) => ({ id: el.id, cls: el.className, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight })),
  );
  expect(bad, `${selector} rola na vertical`).toEqual([]);
}

const TABS_SHOTS = process.env.TABS_SHOTS_DIR;

test.describe("tabs bars never scroll vertically (360/390/1280px)", () => {
  for (const width of [...WIDTHS, 1280] as const) {
    test(`items, detail moves/forms, balls, captured, dex filters (${width}px)`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width);
      await go(page, "items");
      await expect(page.locator("#item-tabs button").first()).toBeVisible();
      await settle(page);
      if (TABS_SHOTS) await page.locator("#item-tabs").screenshot({ path: `${TABS_SHOTS}/item-tabs-${width}.png` });
      await expectNoVerticalScroll(page, "#item-tabs");

      await go(page, "balls");
      await expectNoVerticalScroll(page, ".seg-tabs");

      await seedData(page);
      await go(page, "captured");
      await expectNoVerticalScroll(page, ".seg-tabs");

      await go(page, "dex");
      await expect(page.locator(".dex-screen .pcard").first()).toBeVisible({ timeout: 30_000 });
      if (await page.locator("#filter-types").isVisible()) await expectNoVerticalScroll(page, "#filter-types");

      await openDetail(page, 6);
      for (const sel of ["#move-tabs", "#form-tabs"]) {
        await page.locator(sel).evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
        await settle(page);
        if (TABS_SHOTS) await page.locator(sel).screenshot({ path: `${TABS_SHOTS}/${sel.slice(1)}-${width}.png` });
        await expectNoVerticalScroll(page, sel);
      }
      expect(errors).toEqual([]);
    });
  }
});

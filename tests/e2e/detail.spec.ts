// F4: ficha com o dataset REAL publicado (public/data/current.json), headless, sem slowMo, sem esperas fixas.
// O artwork da PokeAPI e servido por page.route (imagem local), para nao depender da rede; um teste derruba a rota.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

const SHOTS = process.env.DETAIL_SHOTS_DIR;
const ART = readFileSync(new URL("../../src/assets/pokeball.webp", import.meta.url));

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

async function openDetail(page: Page, dex: number) {
  await page.evaluate(async (d) => {
    const mod = (await import("/src/navigation/navigation-store.ts" as string)) as {
      useNavigationStore: { getState(): { navigate(s: string, p: unknown): void } };
    };
    mod.useNavigationStore.getState().navigate("detail", { dex: d });
  }, dex);
  await expect(page.locator(`.detail-screen[data-dex='${dex}'] .hero-card`)).toBeVisible();
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const toggle = page.locator(".tgl-lang:visible").first();
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

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

async function scrollMain(page: Page, y: number) {
  await page.locator("#main").evaluate((m, top) => m.scrollTo({ top, behavior: "instant" }), y);
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/") || url.pathname.startsWith("/assets/cries/"), (route) =>
    route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }),
  );
  await page.route("https://raw.githubusercontent.com/**", (route) => route.fulfill({ status: 200, contentType: "image/webp", body: ART }));
});

test.describe("F4.1 hero", () => {
  test("Charizard: type gradient, seal, title, shiny swap, cry button, history push", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 6);
    const hero = page.locator(".hero-card");
    await expect(hero).toHaveClass(/g-fire/);
    await expect(hero).not.toHaveClass(/hero-legendary|hero-mythical/);
    await expect(hero.locator(".hero-title h2")).toHaveText("Charizard");
    await expect(hero.locator(".hero-title .dex-num")).toHaveText("#0006");
    await expect(hero.locator(".seal .badge")).toHaveCount(1);
    await expect(hero.locator(".badge-nospawn")).toHaveCount(0);
    await expect(hero.locator(".chip")).toHaveText(["Fogo", "Voador"]);
    await expect(hero.locator("#cry-btn")).toBeVisible();
    const img = hero.locator(".artwork-img");
    await expect(img).toHaveAttribute("src", /official-artwork\/6\.png$/);
    await hero.locator("#shiny-btn").click();
    await expect(hero.locator(".artwork-img")).toHaveAttribute("src", /official-artwork\/shiny\/6\.png$/);
    await expect(hero.locator(".hero-img")).toHaveClass(/swap/);
    const top = await page.evaluate(async () => {
      const mod = (await import("/src/state/history-store.ts" as string)) as { useHistoryStore: { getState(): { entries: { dex: number }[] } } };
      return mod.useHistoryStore.getState().entries[0]?.dex;
    });
    expect(top).toBe(6);
    // raios: circulo de 240% da largura do card
    const rays = await hero.locator(".hero-art").evaluate((el) => {
      const cs = getComputedStyle(el, "::before");
      return { ratio: parseFloat(cs.width) / el.getBoundingClientRect().width, radius: cs.borderRadius };
    });
    expect(rays.ratio).toBeCloseTo(2.4, 1);
    expect(rays.radius).toBe("50%");
    if (SHOTS) {
      await hero.locator("#shiny-btn").click();
      await page.mouse.move(1, 1);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/desktop-detail-charizard-hero.png` });
    }
    expect(errors).toEqual([]);
  });

  test("Mewtwo legendary and Mew mythical: special gradient, sheen, 8 sparkles, seal without 'no spawn'", async ({ page }) => {
    await boot(page);
    await openDetail(page, 150);
    let hero = page.locator(".hero-card");
    await expect(hero).toHaveClass(/hero-legendary/);
    await expect(hero.locator(".sparkles i")).toHaveCount(8);
    await expect(hero.locator(".sheen")).toHaveCount(1);
    await expect(hero.locator(".seal .badge-legendary")).toBeVisible();
    await expect(page.getByText(/não nasce no mundo/i)).toHaveCount(0);
    if (SHOTS) {
      await page.mouse.move(1, 1);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/desktop-detail-mewtwo-hero.png` });
    }
    await openDetail(page, 151);
    hero = page.locator(".hero-card");
    await expect(hero).toHaveClass(/hero-mythical/);
    await expect(hero.locator(".seal .badge-mythical")).toBeVisible();
    if (SHOTS) {
      await page.mouse.move(1, 1);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/desktop-detail-mew-hero.png` });
    }
  });

  test("artwork failure shows the pokeball silhouette, never a broken image", async ({ page }) => {
    await boot(page);
    await page.unroute("https://raw.githubusercontent.com/**");
    await page.route("https://raw.githubusercontent.com/**", (route) => route.fulfill({ status: 404, body: "" }));
    await openDetail(page, 25);
    await expect(page.locator(".hero-card .art-placeholder")).toBeVisible();
    await expect(page.locator(".hero-card .artwork-img")).toHaveCount(0);
  });

  test("custom species without artwork shows the notice; unknown dex shows not-found", async ({ page }) => {
    await boot(page);
    await openDetail(page, 9901);
    await expect(page.locator(".hero-card .art-placeholder-notice")).toBeVisible();
    await page.evaluate(async () => {
      const mod = (await import("/src/navigation/navigation-store.ts" as string)) as {
        useNavigationStore: { getState(): { navigate(s: string, p: unknown): void } };
      };
      mod.useNavigationStore.getState().navigate("detail", { dex: 4321 });
    });
    await expect(page.locator(".detail-screen .ob-none")).toBeVisible();
  });

  test("Capturei marks, confirm modal unmarks; team toggle", async ({ page }) => {
    await boot(page);
    await openDetail(page, 25);
    const caught = page.locator("#btn-caught");
    await caught.click();
    await expect(caught).toHaveClass(/done/);
    await caught.click();
    await page.locator("#btn-unmark-confirm").click();
    await expect(caught).not.toHaveClass(/done/);
    const team = page.locator("#btn-team");
    await team.click();
    await expect(team).toHaveClass(/done/);
    await team.click();
    await expect(team).not.toHaveClass(/done/);
  });

  test("Dex with Fire filter + scroll > detail > Back restores filter and scroll", async ({ page }) => {
    await boot(page);
    await page.locator("#btn-open-dex").click();
    await page.locator("[data-ftype='fire']").click();
    await expect(page.locator("#dex-count")).not.toHaveText("1027");
    await scrollMain(page, 900);
    await expect.poll(() => page.locator("#main").evaluate((m) => m.scrollTop)).toBe(900);
    await page.locator(".pcard").nth(2).dispatchEvent("click");
    await expect(page.locator(".detail-screen .hero-card")).toBeVisible();
    await page.goBack();
    await expect(page.locator("[data-ftype='fire']")).toHaveClass(/\bon\b/);
    await expect.poll(async () => Math.abs((await page.locator("#main").evaluate((m) => m.scrollTop)) - 900)).toBeLessThanOrEqual(2);
  });

  for (const width of [360, 390, 1280]) {
    test(`hero without overlap at ${width}px (PT and EN, legendary, mythical and regular)`, async ({ page }) => {
      await boot(page, width, 900);
      for (const dex of [150, 151, 6]) {
        await openDetail(page, dex);
        for (const lang of ["pt", "en"] as const) {
          await setLanguage(page, lang);
          await page.mouse.move(1, 1);
          await settle(page);
          await expectNoOverlap(page, page.locator(".hero-card"), { ignore: [".sparkles", ".sheen"] });
        }
      }
      if (SHOTS && width === 390) await page.screenshot({ path: `${SHOTS}/mobile-detail-hero.png` });
    });
  }
});

test.describe("F4.2 stats, weaknesses and abilities", () => {
  test("Charizard: Rock x4, Water x2, Electric x2, Fire x1/2, Ground x0; selector filters only the grid", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 6);
    const row = (mult: string) => page.locator(`#weak-panel .weak-row[data-mult='${mult}'] .chip`);
    await expect(row("4")).toHaveText(["Pedra"]);
    await expect(row("2")).toContainText(["Água", "Elétrico"]);
    await expect(page.locator("#weak-panel .weak-row[data-mult='0.5'] .chip[data-type='fire']")).toHaveCount(1);
    await expect(row("0")).toHaveText(["Terra"]);
    const entry = await page.locator(".screen").getAttribute("data-entry-id");
    await page.locator("#weak-panel .seg-sm button", { hasText: "Fraquezas" }).click();
    await expect(page.locator("#weak-panel .weak-row")).toHaveCount(2);
    await page.locator("#weak-panel .seg-sm button", { hasText: "Resistências" }).click();
    await expect(page.locator("#weak-panel .weak-row[data-mult='4']")).toHaveCount(0);
    await expect(page.locator("#weak-panel .weak-row[data-mult='0']")).toHaveCount(1);
    await expect(page.locator(".screen")).toHaveAttribute("data-entry-id", entry ?? "");
    // termos EN so no card de fraquezas
    await page.locator("#weak-panel .terms-tgl [data-tl='en']").click();
    await expect(row("0")).toHaveText(["Ground"]);
    await expect(page.locator(".hero-card .chip").first()).toHaveText("Fogo");
    // stats: BST 534 e 6 barras
    await expect(page.locator(".stats-panel .stat")).toHaveCount(6);
    await expect(page.locator(".stats-panel [data-stat='total']")).toHaveText("534");
    // habilidades: Blaze + Solar Power (oculta)
    await expect(page.locator("#abilities-panel .ability")).toHaveCount(2);
    await expect(page.locator("#abilities-panel .ability .tag")).toHaveCount(1);
    await expect(page.locator("#abilities-panel .ab-desc").first()).not.toBeEmpty();
    if (SHOTS) {
      await page.locator("#weak-panel .seg-sm button", { hasText: "Todos" }).click();
      await page.mouse.move(1, 1);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/desktop-detail-charizard-resistances.png`, fullPage: false });
    }
    expect(errors).toEqual([]);
  });

  for (const width of [360, 390, 1280]) {
    test(`panels without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 900);
      await openDetail(page, 6);
      await expect(page.locator("#abilities-panel .ability").first()).toBeVisible();
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await page.mouse.move(1, 1);
        await settle(page);
        for (const sel of [".stats-panel", "#weak-panel", "#abilities-panel"]) await expectNoOverlap(page, page.locator(sel));
      }
    });
  }
});

test.describe("F4.3 evolution chain", () => {
  test("Eevee: 8 branches with real methods; Jolteon stone opens the item page", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 133);
    const branches = page.locator("#evo-panel .evo-branch");
    await expect(branches).toHaveCount(8);
    await expect(page.locator("#evo-panel .evo-branch[data-to='196'] .method")).toHaveText("Amizade 160 + de dia");
    await expect(page.locator("#evo-panel .evo-branch[data-to='700'] .method")).toHaveText("Amizade 160 + sabendo golpe de Fada");
    const stone = page.locator("#evo-panel .evo-branch[data-to='135'] .evo-item");
    await expect(stone).toHaveText("Pedra do Trovão");
    if (SHOTS) {
      await page.mouse.move(1, 1);
      await settle(page);
      await page.locator("#evo-panel").screenshot({ path: `${SHOTS}/detail-eevee-evo.png` });
    }
    await stone.click();
    await expect(page.locator("[data-screen='item']")).toBeVisible();
    await page.goBack();
    await expect(page.locator("#evo-panel .evo-branch")).toHaveCount(8);
    await page.locator("#evo-panel .evo-branch[data-to='135'] button.evo").click();
    await expect(page.locator(".detail-screen[data-dex='135'] .hero-title h2")).toHaveText("Jolteon");
    expect(errors).toEqual([]);
  });

  test("Charizard linear chain 16/36; species without evolution says so", async ({ page }) => {
    await boot(page);
    await openDetail(page, 6);
    await expect(page.locator("#evo-panel .evo-chain .evo")).toHaveCount(3);
    await expect(page.locator("#evo-panel .evo-chain .method")).toHaveText(["Nível 16", "Nível 36"]);
    await expect(page.locator("#evo-panel .evo.current")).toHaveAttribute("data-evo", "6");
    await openDetail(page, 128);
    await expect(page.locator("#evo-panel .evo-none")).toHaveText("Não evolui");
  });

  for (const width of [360, 390, 1280]) {
    test(`evolution panel without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 900);
      for (const dex of [133, 6]) {
        await openDetail(page, dex);
        for (const lang of ["pt", "en"] as const) {
          await setLanguage(page, lang);
          await page.mouse.move(1, 1);
          await settle(page);
          await expectNoOverlap(page, page.locator("#evo-panel"));
        }
      }
    });
  }
});

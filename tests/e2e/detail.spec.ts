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

test.describe("F4.4 moves", () => {
  test("Charizard: tabs, TM table with mechanics and PP, description expands, tab switch keeps scroll and entry", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 6);
    const panel = page.locator("#moves-panel");
    await expect(panel.locator("#move-tabs button")).toHaveText(["Nível", "TM", "Ovo", "Tutor"]);
    await expect(panel.locator("tbody .mv-row")).toHaveCount(18);
    const levels = await panel.locator("tbody .mv-row td.num:first-child").allTextContents();
    const nums = levels.map(Number);
    expect([...nums].sort((a, b) => a - b)).toEqual(nums);
    await panel.locator("#move-tabs").evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    const entry = await page.locator(".screen").getAttribute("data-entry-id");
    const scrollBefore = await page.locator("#main").evaluate((m) => m.scrollTop);
    await panel.locator("#move-tabs [data-mtab='tm']").click();
    await expect(panel.locator("#move-tabs [data-mtab='tm']")).toHaveClass(/active/);
    await expect(panel.locator("tbody .mv-row")).toHaveCount(85);
    await expect(page.locator(".screen")).toHaveAttribute("data-entry-id", entry ?? "");
    expect(Math.abs((await page.locator("#main").evaluate((m) => m.scrollTop)) - scrollBefore)).toBeLessThanOrEqual(2);
    const eq = panel.locator(".mv-row[data-mv='earthquake']");
    await expect(eq.locator(".mv-name")).toContainText("Terremoto");
    await expect(eq.locator(".mv-en")).toHaveText("Earthquake");
    await expect(eq.locator(".chip")).toHaveText("Terra");
    await expect(eq.locator(".cat")).toHaveText("Físico");
    await expect(eq.locator("td.num")).toHaveText(["TM", "100", "100%", "10"]);
    const dd = panel.locator(".mv-row[data-mv='dragondance']");
    await expect(dd.locator("td.num")).toHaveText(["TM", "-", "-", "20"]);
    // descricao expansivel, estado em current.ui.openMoveRows
    await eq.click();
    await expect(eq).toHaveClass(/open/);
    await expect(eq.locator("xpath=following-sibling::tr[1]").locator(".desc-wrap")).toHaveClass(/open/);
    const ui = await page.evaluate(async () => {
      const mod = (await import("/src/navigation/navigation-store.ts" as string)) as { useNavigationStore: { getState(): { current: { ui: unknown } } } };
      return mod.useNavigationStore.getState().current.ui as { moveTab: string; openMoveRows: string[] };
    });
    expect(ui.moveTab).toBe("tm");
    expect(ui.openMoveRows).toEqual(["earthquake"]);
    // termos EN so no card de golpes
    await panel.locator(".terms-tgl [data-tl='en']").click();
    await expect(eq.locator(".mv-name")).toContainText("Earthquake");
    await expect(eq.locator(".mv-en")).toHaveText("Terremoto");
    await expect(page.locator(".hero-card .chip").first()).toHaveText("Fogo");
    if (SHOTS) {
      await panel.locator(".terms-tgl [data-tl='pt']").click();
      await eq.click();
      await page.mouse.move(1, 1);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/desktop-detail-charizard-moves-tm.png`, fullPage: false });
    }
    expect(errors).toEqual([]);
  });

  test("open rows and tab restored after navigating away and Back; empty tab shows empty state", async ({ page }) => {
    await boot(page);
    await openDetail(page, 6);
    const panel = page.locator("#moves-panel");
    await panel.locator("#move-tabs [data-mtab='tm']").click();
    await panel.locator(".mv-row[data-mv='flamethrower']").click();
    await expect(panel.locator(".mv-row[data-mv='flamethrower']")).toHaveClass(/open/);
    await openDetail(page, 132);
    await page.locator("#moves-panel #move-tabs [data-mtab='tm']").click();
    await expect(page.locator("#moves-panel .empty-state")).toContainText("Nenhum golpe nesta categoria");
    await page.goBack();
    await expect(page.locator(".detail-screen[data-dex='6'] #moves-panel #move-tabs [data-mtab='tm']")).toHaveClass(/active/);
    await expect(page.locator("#moves-panel .mv-row[data-mv='flamethrower']")).toHaveClass(/open/);
  });

  for (const width of [360, 390, 1280]) {
    test(`moves panel without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 900);
      await openDetail(page, 6);
      await expect(page.locator("#moves-panel tbody .mv-row").first()).toBeVisible();
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await page.locator("#moves-panel #move-tabs [data-mtab='tm']").click();
        await page.mouse.move(1, 1);
        await settle(page);
        await expectNoOverlap(page, page.locator("#moves-panel"));
        if (width === 1280) {
          const wrap = page.locator("#moves-table");
          expect(await wrap.evaluate((w) => w.scrollWidth - w.clientWidth)).toBeLessThanOrEqual(1);
        }
      }
    });
  }
});

test.describe("F5.1 where to find and how to obtain", () => {
  test("Eevee: 5 spawn entries, primary Uncommon with Rare/Ultra-rare secondary, clickable drops, breeding", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 133);
    const panel = page.locator("#where-panel");
    await expect(panel.locator(".where-rarity .badge")).toHaveText(["Incomum", "Raro", "Ultra-raro"]);
    await expect(panel.locator(".spawn-entry")).toHaveCount(5);
    await expect(panel.locator(".spawn-entry").first().locator(".biome").first()).toHaveText("Mundo Aberto");
    await expect(panel.locator(".spawn-entry").first()).toContainText("Luz do céu 8-15");
    await expect(panel.locator(".drop")).toHaveCount(2);
    await expect(panel.locator("[data-obtain='breeding']")).toContainText("Campo");
    if (SHOTS) {
      await panel.scrollIntoViewIfNeeded();
      await page.mouse.move(1, 1);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/desktop-detail-eevee-where.png`, fullPage: false });
    }
    await expect(panel.locator(".ob-none")).toHaveCount(0);
    await panel.locator(".drop [data-item='cobblemon:eviolite']").click();
    await expect(page.locator(".screen")).not.toHaveAttribute("data-screen", "detail");
    await page.goBack();
    await expect(page.locator(".detail-screen[data-dex='133'] #where-panel")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Mewtwo: addon ultra-rare spawn (caves/Deep Dark, 70-75), fossil items and 'via' addon, no generic notice", async ({ page }) => {
    await boot(page);
    await openDetail(page, 150);
    const panel = page.locator("#where-panel");
    const entry = panel.locator(".spawn-entry");
    await expect(entry).toHaveCount(1);
    await expect(entry.locator(".badge")).toHaveText("Ultra-raro");
    await expect(entry).toContainText("70-75");
    await expect(entry.locator(".biome")).toContainText(["Caverna"]);
    await expect(entry.locator(".tag")).toHaveText("Cobblemon Community Content");
    const fossil = panel.locator("[data-obtain='fossil']");
    await expect(fossil.locator(".it-link")).toHaveCount(2);
    await expect(fossil.locator("[data-item='allthemons:pika_star']")).toBeVisible();
    await expect(fossil.locator("[data-item='allthemons:ancient_dna_sample']")).toBeVisible();
    await expect(panel.locator("[data-obtain='addon']")).toContainText("via Cobblemon Community Content");
    await expect(panel.locator(".ob-none")).toHaveCount(0);
  });

  test("Magikarp collapses 46 entries after 6; Pichu shows .ob-none; Ivysaur evolution links to Bulbasaur", async ({ page }) => {
    await boot(page);
    await openDetail(page, 129);
    const panel = page.locator("#where-panel");
    await expect(panel.locator(".spawn-entry")).toHaveCount(6);
    await panel.locator(".spawn-more").click();
    await expect(panel.locator(".spawn-entry")).toHaveCount(46);
    await openDetail(page, 172);
    await expect(page.locator("#where-panel .ob-none")).toHaveCount(1);
    await openDetail(page, 2);
    const evo = page.locator("#where-panel [data-obtain='evolution']");
    await expect(evo).toContainText("Evolua Bulbasaur (Nível 16)");
    await evo.locator(".ob-link").click();
    await expect(page.locator(".detail-screen[data-dex='1'] .hero-card")).toBeVisible();
  });

  for (const width of [360, 390, 1280]) {
    test(`where panel without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 900);
      await openDetail(page, 150);
      await expect(page.locator("#where-panel .spawn-entry").first()).toBeVisible();
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await page.mouse.move(1, 1);
        await settle(page);
        await expectNoOverlap(page, page.locator("#where-panel"));
      }
    });
  }
});

test.describe("F5.2 forms", () => {
  test("Charizard Mega X: Fire/Dragon, Charizardite X + Keystone clickable, addon source, battle-only; Gmax has no item", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 6);
    const panel = page.locator("#forms-panel");
    await expect(panel.locator("#form-tabs button")).toHaveText(["Normal", "Mega-X", "Mega-Y", "Gmax"]);
    await expect(panel.locator(".form-req")).toContainText("Forma base, sem item");
    const entry = await page.locator(".screen").getAttribute("data-entry-id");
    await panel.locator("#form-tabs [data-ftab='1']").click();
    await expect(page.locator(".screen")).toHaveAttribute("data-entry-id", entry ?? "");
    await expect(panel.locator("#form-body .types .chip")).toHaveText(["Fogo", "Dragão"]);
    await expect(panel.locator("#form-body .types .tag")).toHaveText("Só em batalha");
    await expect(panel.locator(".form-req [data-item='mega_showdown:charizardite_x']")).toBeVisible();
    await expect(panel.locator(".form-req [data-item='mega_showdown:keystone']")).toBeVisible();
    await expect(panel.locator(".form-req")).toContainText("(Mega Showdown)");
    await expect(panel.locator(".form-ability strong")).toHaveText("Garras Duras");
    await expect(panel.locator(".form-art .artwork-img")).toHaveAttribute("src", /official-artwork\/10034\.png$/);
    await expect(panel.locator(".stat-total .stat-val")).toHaveText("634");
    if (SHOTS) {
      await panel.scrollIntoViewIfNeeded();
      await page.mouse.move(1, 1);
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/desktop-detail-charizard-mega-x-form.png`, fullPage: false });
    }
    await panel.locator("#form-tabs [data-ftab='3']").click();
    await expect(panel.locator(".form-req")).toContainText("Nenhum item necessário");
    await panel.locator("#form-tabs [data-ftab='1']").click();
    await panel.locator(".form-req [data-item='mega_showdown:charizardite_x']").click();
    await expect(page.locator(".screen")).toHaveAttribute("data-screen", "item");
    await page.goBack();
    await expect(page.locator("#forms-panel #form-tabs [data-ftab='1']")).toHaveClass(/active/);
    expect(errors).toEqual([]);
  });

  test("species without forms hides the panel", async ({ page }) => {
    await boot(page);
    await openDetail(page, 132);
    await expect(page.locator("#abilities-panel")).toBeVisible();
    await expect(page.locator("#forms-panel")).toHaveCount(0);
  });

  for (const width of [360, 390, 1280]) {
    test(`forms panel without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 900);
      await openDetail(page, 6);
      await page.locator("#forms-panel #form-tabs [data-ftab='1']").click();
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await page.mouse.move(1, 1);
        await settle(page);
        await expectNoOverlap(page, page.locator("#forms-panel"));
      }
    });
  }
});

test.describe("F5.3 best ball", () => {
  test("Magikarp: top 3 ranked, Net Ball (3x) above Poke Ball, Dusk Ball shows its light-0 condition, guaranteed row, item link", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 129);
    const panel = page.locator("#best-panel");
    await expect(panel.locator(".best-ball")).toHaveCount(3);
    await expect(panel.locator(".best-ball").first()).toHaveClass(/best-first/);
    await expect(panel.locator(".best-rank")).toHaveText(["1", "2", "3"]);
    await expect(panel.locator(".best-guaranteed")).toContainText("Captura garantida:");
    await expect(panel.locator(".best-guaranteed")).toContainText("Bola Mestra");
    await expect(panel.locator(".best-crit")).toContainText("Captura crítica:");
    await panel.locator(".best-more").click();
    const ids = await panel.locator(".best-ball").evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.ball));
    expect(ids.indexOf("net_ball")).toBeGreaterThan(-1);
    expect(ids.indexOf("net_ball")).toBeLessThan(ids.indexOf("poke_ball"));
    await expect(panel.locator("[data-ball='net_ball'] .ball-mult")).toHaveText("3x");
    await expect(panel.locator("[data-ball='net_ball'] .ball-eff")).toHaveText("Tipo Água / Inseto");
    await expect(panel.locator("[data-ball='dusk_ball'] .ball-eff")).toHaveText("3.5x com luz 0");
    await expect(panel.locator("[data-ball='love_ball']")).toHaveCount(1);
    await expect(panel.locator("[data-ball='lure_ball']")).toHaveCount(1);
    await panel.locator("[data-ball='net_ball']").click();
    await expect(page.locator(".screen")).toHaveAttribute("data-screen", "item");
    await page.goBack();
    await expect(page.locator("#best-panel")).toBeVisible();
    await page.locator("#best-panel .best-all").click();
    await expect(page.locator(".screen")).toHaveAttribute("data-screen", "balls");
    expect(errors).toEqual([]);
  });

  test("genderless and non-water species: no Love, Lure or Dive Ball; EN terms", async ({ page }) => {
    await boot(page);
    await openDetail(page, 81);
    const panel = page.locator("#best-panel");
    await panel.locator(".best-more").click();
    await expect(panel.locator("[data-ball='love_ball']")).toHaveCount(0);
    await expect(panel.locator("[data-ball='lure_ball']")).toHaveCount(0);
    await expect(panel.locator("[data-ball='dive_ball']")).toHaveCount(0);
    await panel.locator(".terms-tgl [data-tl='en']").click();
    await expect(panel.locator("[data-ball='dusk_ball'] .ball-name-main")).toHaveText("Dusk Ball");
    await expect(panel.locator("[data-ball='dusk_ball'] .ball-eff")).toHaveText("3.5x com luz 0");
  });

  for (const width of [360, 390, 1280]) {
    test(`best ball panel without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 900);
      await openDetail(page, 129);
      await page.locator("#best-panel .best-more").click();
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await page.mouse.move(1, 1);
        await settle(page);
        await expectNoOverlap(page, page.locator("#best-panel"));
      }
      if (SHOTS && width === 1280) {
        await page.locator("#best-panel").scrollIntoViewIfNeeded();
        await page.locator("#best-panel").screenshot({ path: `${SHOTS}/desktop-detail-best-ball.png` });
      }
    });
  }
});

test.describe("F5.4 calculators", () => {
  test("base 100 / L100 / IV 31 / EV 252: neutral 299, favorable 328, unfavorable 269; EV over 510 freezes the output", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 151);
    const calc = page.locator("#calc");
    await calc.locator("summary").click();
    await expect(calc).toHaveAttribute("open", "");
    await calc.locator("#c-lv").fill("100");
    await calc.locator("[data-ev='attack']").fill("252");
    const atk = calc.locator("#calc-out .co[data-stat='attack'] b");
    await expect(atk).toHaveText("299");
    await calc.locator("#c-nat").selectOption("adamant");
    await expect(atk).toHaveText("328");
    await expect(calc.locator("#calc-out .co[data-stat='attack']")).toHaveClass(/up/);
    await calc.locator("#c-nat").selectOption("modest");
    await expect(atk).toHaveText("269");
    await expect(calc.locator("#calc-out .co[data-stat='attack']")).toHaveClass(/down/);
    await calc.locator("#c-lv").fill("500");
    await expect(calc.locator("#c-lv")).toHaveValue("100");
    await calc.locator("[data-ev='defence']").fill("252");
    await calc.locator("[data-ev='speed']").fill("252");
    await expect(calc.locator(".calc-ev-total")).toHaveClass(/invalid/);
    await expect(calc.locator("[data-ev='speed']")).toHaveClass(/invalid/);
    await expect(calc.locator("#calc-out")).toHaveClass(/stale/);
    await expect(atk).toHaveText("269");
    await calc.locator("[data-ev='speed']").fill("0");
    await expect(calc.locator("#calc-out")).not.toHaveClass(/stale/);
    expect(errors).toEqual([]);
  });

  test("Charizard recommends IV 31 in Sp. Atk (109) and Speed (100) and Apply fills the inputs; state survives Back", async ({ page }) => {
    await boot(page);
    await openDetail(page, 6);
    const calc = page.locator("#calc");
    await calc.locator("summary").click();
    await expect(calc.locator("#calc-rec")).toContainText("IV 31 em At. Esp. (109) e Velocidade (100); EV 252/252/4 sugeridos");
    await expect(calc.locator("[data-ev='specialAttack']")).toHaveValue("0");
    await calc.locator(".calc-apply").click();
    await expect(calc.locator("[data-ev='specialAttack']")).toHaveValue("252");
    await expect(calc.locator("[data-ev='speed']")).toHaveValue("252");
    await expect(calc.locator("[data-ev='specialDefence']")).toHaveValue("4");
    await expect(calc.locator("[data-iv='hp']")).toHaveValue("31");
    await openDetail(page, 1);
    await page.goBack();
    await expect(page.locator(".detail-screen[data-dex='6'] #calc")).toHaveAttribute("open", "");
    await expect(page.locator("#calc [data-ev='speed']")).toHaveValue("252");
  });

  test("type calculator: prefilled with the species types; Fire/Water vs Fire = x1/4", async ({ page }) => {
    await boot(page);
    await openDetail(page, 6);
    const calc = page.locator("#calc");
    await calc.locator("summary").click();
    await expect(calc.locator("#c-t1")).toHaveValue("fire");
    await expect(calc.locator("#c-t2")).toHaveValue("flying");
    await expect(calc.locator(".tc-cell")).toHaveCount(18);
    await expect(calc.locator(".tc-cell[data-attacker='rock'] .mult")).toHaveText("x4");
    await expect(calc.locator(".tc-cell[data-attacker='ground'] .mult")).toHaveText("x0");
    await calc.locator("#c-t2").selectOption("water");
    await expect(calc.locator(".tc-cell[data-attacker='fire'] .mult")).toHaveText("x¼");
    await expect(calc.locator(".tc-cell[data-attacker='normal'] .mult")).toHaveText("x1");
    await calc.locator("#c-t2").selectOption("");
    await expect(calc.locator(".tc-cell[data-attacker='fire'] .mult")).toHaveText("x½");
  });

  for (const width of [360, 390, 1280]) {
    test(`calculators without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 900);
      await openDetail(page, 6);
      await page.locator("#calc summary").click();
      await page.locator("#calc [data-ev='speed']").fill("252");
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await page.mouse.move(1, 1);
        await settle(page);
        await expectNoOverlap(page, page.locator("#calc"));
      }
      if (SHOTS) {
        await page.locator("#calc").scrollIntoViewIfNeeded();
        await page.locator("#calc").screenshot({ path: `${SHOTS}/detail-calc-${width}.png` });
      }
    });
  }
});

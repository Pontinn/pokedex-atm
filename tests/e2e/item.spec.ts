// F9.3: pagina do item com o dataset REAL, headless, sem slowMo, sem esperas fixas. PW_DEV=1 PW_PORT=4175.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { expectNoOverlap } from "../harness/no-overlap";

const SHOTS = process.env.ITEM_SHOTS_DIR;
const DEV = process.env.PW_DEV === "1";
type NavModule = typeof import("../../src/navigation/navigation-store");
const NAV_URL = "/src/navigation/navigation-store.ts";

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
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

// So usado no caminho dev-only (item que nao existe no dataset publicado: nenhum link real da UI leva a ele,
// so um deep-link/sync antigo poderia).
async function nav(page: Page, screen: string, params?: unknown) {
  await page.evaluate(
    async ({ url, screen, params }) => {
      const mod = (await import(/* @vite-ignore */ url)) as NavModule;
      (mod.useNavigationStore.getState().navigate as (s: string, p?: unknown) => void)(screen, params);
    },
    { url: NAV_URL, screen, params },
  );
}

async function openItemDevOnly(page: Page, itemId: string) {
  await nav(page, "item", { itemId });
  await expect(page.locator(`.item-body[data-item="${itemId}"] .item-hero`)).toBeVisible({ timeout: 30_000 });
}

// Navegacao por interacao real de UI (tela Itens: sidebar/tabbar + busca): funciona em dev e em build+preview.
async function openItem(page: Page, itemId: string, query: string) {
  if (!(await page.locator(".items-screen").isVisible().catch(() => false))) {
    let link = page.locator('[data-nav="items"]:visible').first();
    if ((await link.count()) === 0) {
      await page.locator('[data-nav="more"]:visible').first().click();
      link = page.locator('[data-nav="items"]:visible').first();
    }
    await link.click();
    await expect(page.locator(".items-screen")).toBeVisible();
  }
  await page.locator("#item-q").fill(query);
  const link = page.locator(`.item-card[data-item="${itemId}"] .item-link`);
  await expect(link).toBeVisible();
  await link.click();
  await expect(page.locator(`.item-body[data-item="${itemId}"] .item-hero`)).toBeVisible({ timeout: 30_000 });
}

async function openDetail(page: Page, dex: number) {
  if (!(await page.locator(".home-screen").isVisible().catch(() => false))) {
    await page.locator('[data-nav="home"]:visible').first().click();
    await expect(page.locator(".home-screen")).toBeVisible();
  }
  await page.locator("#search-input").fill(String(dex));
  const item = page.locator(`.search-dd .dd-item[data-dex='${dex}']`);
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator(`.detail-screen[data-dex='${dex}']`)).toBeVisible();
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await page.locator(".tgl-lang:visible").first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

const mainScroll = (page: Page) => page.locator("#main").evaluate((m) => m.scrollTop);

// Espera as animacoes e transicoes finitas (screenIn/cardIn, abrir .desc-wrap) terminarem, como em detail.spec.ts.
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

// Clique de mouse cru no centro do alvo (como o usuario), com o alvo levado a vista SEM animacao: o locator.click()
// faz o "scroll into view if needed" do Playwright, que com o scroll-behavior: smooth do #main segue animando o
// scroll depois do clique (mesma fragilidade corrigida em detail.spec.ts).
async function clickCenter(page: Page, target: Locator) {
  await target.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await settle(page);
  const box = await target.boundingBox();
  if (!box) throw new Error("click target without bounding box");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test("F9.3 Potion page: hero, honest obtain, used in effect, terms toggle", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await boot(page);
  await openItem(page, "cobblemon:potion", "potion");
  const hero = page.locator(".item-hero");
  await expect(hero.locator("h2")).toHaveText("Poção");
  await expect(hero.locator(".item-alt")).toHaveText("Potion");
  await expect(hero.locator(".badge")).toHaveText(/medicina/i);
  await expect(hero.locator(".item-hero-desc")).toHaveText("Restaura 20 PV de um Pokémon");
  const img = hero.locator(".item-hero-tile img");
  await expect(img).toHaveCSS("image-rendering", "pixelated");
  expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  const obtain = page.locator(".item-obtain");
  await expect(obtain.locator(".ob-row[data-row='craftable']")).toContainText("Sim, tem receita");
  // U7b/U7c: blocks/** virou blockDrop (a tabela blocks/potion so derruba a propria pocao, nao conta) e o loot de
  // bau vem de todos os namespaces.
  await expect(obtain.locator(".ob-row[data-row='structureLoot'] .biome")).toHaveText([
    "Chests (burned tower)",
    "Chests (fishing)",
    "Chests (generic dungeon)",
    "Chests (great dungeon)",
    "Chests (pharmacy)",
    "Chests (snowpoint regice)",
    "Chests (snowpoint regirock)",
    "Chests (snowpoint registeel)",
  ]);
  await expect(page.locator(".item-used .ob-row[data-row='effect']")).toContainText("Restaura 20 PV");
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/item-potion-1280.png` });
  await page.locator('.terms-tgl[data-tcard="itempage"] [data-tl="en"]').click();
  await expect(hero.locator("h2")).toHaveText("Potion");
  await expect(hero.locator(".item-hero-desc")).toHaveText("Restaura 20 PV de um Pokémon");
  expect(errors).toEqual([]);
});

test("F9.3 Fire Stone used in evolutions, chips open the entry; no route; ball", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await boot(page);
  await openItem(page, "cobblemon:fire_stone", "fire stone");
  const evo = page.locator(".item-used .ob-row[data-row='evolutions']");
  await expect(evo).toContainText("Evolui");
  const pairs = await evo
    .locator(".evo-pair")
    .evaluateAll((els) => els.map((e) => [...e.querySelectorAll(".mon-chip span")].map((s) => s.textContent).join(" -> ")));
  for (const p of ["Eevee -> Flareon", "Vulpix -> Ninetales", "Growlithe -> Arcanine"]) expect(pairs).toContain(p);
  await expect(page.locator(".item-obtain .ob-row[data-row='drop'] .mon-chip b").first()).toHaveText(/%$/);
  await evo.locator(".mon-chip[data-dex='133']").click();
  await expect(page.locator(".detail-screen[data-dex='133']")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".item-body[data-item='cobblemon:fire_stone']")).toBeVisible();

  await openItem(page, "allthemodium:allthemodium_ingot", "allthemodium");
  // U7a/U7c/U7d: o dataset publicado nao tem mais item sem rota; o lingote ganhou receita e missao. O texto sem rota
  // segue conferido no item desconhecido (abaixo) e em tests/unit/ui-screens/item-page.test.ts.
  await expect(page.locator(".item-obtain .ob-row[data-row='craftable']")).toContainText("Sim, tem receita");
  await expect(page.locator(".item-obtain .ob-row[data-row='questReward']")).toBeVisible();
  await expect(page.locator(".item-obtain .ob-none")).toHaveCount(0);

  await openItem(page, "cobblemon:dusk_ball", "dusk ball");
  await expect(page.locator(".item-used .ob-row[data-row='ball']")).toContainText("Multiplicador de captura");
  expect(errors).toEqual([]);
});

// othermod:strange_widget nao existe em items.json (nenhum link real da UI leva a ele; e um teste de
// deep-link/sync com um item de outro mod desconhecido). Sem caminho de UI ate ele, so dev (mesmo padrao do
// dex desconhecido em detail.spec.ts).
test("F9.3 unknown item (not in the dataset) shows a generic name and no route; Back returns to it", async ({ page }) => {
  test.skip(!DEV, "othermod:strange_widget nao existe no dataset publicado; sem link de UI ate ele");
  const errors = trackConsoleErrors(page);
  await boot(page);
  await openItemDevOnly(page, "othermod:strange_widget");
  await expect(page.locator(".item-hero h2")).toHaveText("Strange widget");
  await expect(page.locator(".item-hero .badge")).toHaveText(/item de outro mod/i);
  await expect(page.locator(".item-hero .item-hero-tile img")).toHaveCount(0);
  await expect(page.locator(".item-obtain .ob-none")).toBeVisible();

  await openItemDevOnly(page, "cobblemon:dusk_ball");
  await expect(page.locator(".item-used .ob-row[data-row='ball']")).toContainText("Multiplicador de captura");
  await page.locator(".item-screen .detail-back").click();
  await expect(page.locator(".item-body[data-item='othermod:strange_widget']")).toBeVisible();
  expect(errors).toEqual([]);
});

test("F9.3 Charizard > TM moves > scroll > item > Back restores tab, scroll and open rows", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await boot(page);
  await openDetail(page, 6);
  const panel = page.locator("#moves-panel");
  await expect(panel).toBeVisible({ timeout: 30_000 });
  // medido (scroll do #main instrumentado): com locator.click() o #main anima suave depois de cada clique e a
  // transicao de abrir a descricao ainda cresce a pagina (a ancoragem de scroll soma ~7 px) DEPOIS de "saved" ser
  // lido; o app salva e restaura exatamente o scroll que tinha ao sair (2640 -> 2640), o teste e que media cedo.
  await clickCenter(page, panel.locator("#move-tabs [data-mtab='tm']"));
  await expect(panel.locator("#move-tabs [data-mtab='tm']")).toHaveClass(/active/);
  const eq = panel.locator(".mv-row[data-mv='earthquake']");
  await clickCenter(page, eq);
  await expect(eq).toHaveClass(/open/);
  await settle(page);
  await page.locator("#main").evaluate((m) => m.scrollTo({ top: m.scrollTop + 700, behavior: "instant" }));
  const saved = await mainScroll(page);
  expect(saved).toBeGreaterThan(0);
  // A ficha do Charizard ainda nao tem item clicavel (formas e melhor bola sao F5): o item e aberto pela tela
  // Itens (sidebar/tabbar + busca), como um clique real de UI.
  await openItem(page, "cobblemon:potion", "potion");
  // openItem passa pela tela Itens (sidebar + busca): 2 entradas na pilha (Itens, depois o item) para desfazer.
  await page.goBack();
  await page.goBack();
  await expect(panel.locator("#move-tabs [data-mtab='tm']")).toHaveClass(/active/);
  await expect(panel.locator(".mv-row[data-mv='earthquake']")).toHaveClass(/open/);
  await expect.poll(async () => Math.abs((await mainScroll(page)) - saved)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});

for (const lang of ["pt", "en"] as const) {
  for (const width of [360, 390, 1280]) {
    test(`F9.3 no overlap ${lang} ${width}px`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width, 800);
      await setLanguage(page, lang);
      for (const [id, query] of [
        ["cobblemon:fire_stone", "fire stone"],
        ["cobblemon:potion", "potion"],
      ] as const) {
        await openItem(page, id, query);
        await expectNoOverlap(page, ".item-screen");
      }
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/item-${lang}-${width}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    // othermod:strange_widget nao existe no dataset publicado (sem link de UI ate ele, ver teste dev-only acima).
    test(`F9.3 no overlap ${lang} ${width}px (unknown item, dev-only)`, async ({ page }) => {
      test.skip(!DEV, "othermod:strange_widget nao existe no dataset publicado; sem link de UI ate ele");
      const errors = trackConsoleErrors(page);
      await boot(page, width, 800);
      await setLanguage(page, lang);
      await openItemDevOnly(page, "othermod:strange_widget");
      await expectNoOverlap(page, ".item-screen");
      expect(errors).toEqual([]);
    });
  }
}
test.describe("spawn-bait: item page (bait effects and Campfire Pot recipe)", () => {
  test("Occa (CA-18): bait effects panel with the game text in PT and EN, seasoning yes; Como obter unchanged", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openItem(page, "cobblemon:occa_berry", "Occa");
    const panel = page.locator("[data-bait-effects]");
    await expect(panel.locator("h3")).toHaveText("Efeitos de isca");
    await expect(panel).toContainText("Tipo Fogo");
    await expect(panel.locator("[data-row='bait-seasoning']")).toContainText("Aceito como tempero");
    // berry-mutations RF-13: Plantavel da baga vira Encontrada no mundo + Cresce melhor em
    await expect(page.locator(".item-obtain .ob-row")).toHaveCount(5);
    await page.locator("[data-tcard='itempage'] [data-tl='en']").click();
    await expect(panel).toContainText("Fire Types");
    expect(errors).toEqual([]);
  });

  test("enchanted golden apple (CA-19): bite time, rarity +10 and shiny 6x", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openItem(page, "minecraft:enchanted_golden_apple", "Enchanted Golden Apple");
    const panel = page.locator("[data-bait-effects]");
    await expect(panel.locator("[data-row]")).toHaveCount(4);
    await expect(panel).toContainText("+10");
    await expect(panel).toContainText("6×");
    await expect(page.locator(".item-hero .badge")).toHaveText("Iscas");
    expect(errors).toEqual([]);
  });

  test("Poké Snack (CA-20): ingredients in order, seasoning note, Iscas chip, no cooking note, Campfire Pot", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openItem(page, "cobblemon:poke_snack", "Poke Snack");
    const recipe = page.locator("[data-pot-recipe='cobblemon:campfire_pot/poke_snack']");
    const ings = recipe.locator(".pot-ing");
    await expect(ings).toHaveCount(4);
    expect(await ings.evaluateAll((els) => els.map((e) => e.getAttribute("data-ingredient")))).toEqual(["c:drinks/milk", "minecraft:honey_bottle", "cobblemon:vivichoke", "cobblemon:hearty_grains"]);
    await expect(ings.nth(0)).toContainText("3x");
    await expect(ings.nth(0)).toContainText("Qualquer leite");
    await expect(ings.nth(1)).toContainText("2x");
    await expect(ings.nth(2)).toContainText("1x");
    await expect(ings.nth(3)).toContainText("3x");
    await expect(recipe.locator(".pot-seasoning")).toContainText("mais até 3 temperos");
    await expect(page.locator(".item-hero .badge")).toHaveText("Iscas");
    await expect(page.locator(".item-cooking-note")).toHaveCount(0);
    await expect(page.locator("[data-bait-effects]")).toHaveCount(0);
    await expect(page.locator(".item-obtain [data-row='craftable'] .badge")).toContainText("Panela de Fogueira");
    await ings.nth(1).locator("[data-item='minecraft:honey_bottle']").click();
    await expect(page.locator('.item-body[data-item="minecraft:honey_bottle"] .item-hero')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Poké Bait (CA-21): Iscas chip, wheat as plain text, mushrooms tag, no effects panel", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openItem(page, "cobblemon:poke_bait", "Poke Bait");
    await expect(page.locator(".item-hero .badge")).toHaveText("Iscas");
    await expect(page.locator("[data-ingredient='minecraft:wheat'] button")).toHaveCount(0);
    await expect(page.locator("[data-ingredient='minecraft:wheat']")).toContainText("Trigo");
    await expect(page.locator("[data-ingredient='c:mushrooms']")).toContainText("Qualquer cogumelo");
    await expect(page.locator("[data-bait-effects]")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("Love Sweet (CA-22): Campfire Pot station label in PT and EN", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openItem(page, "cobblemon:love_sweet", "Love Sweet");
    const badge = page.locator(".item-obtain [data-row='craftable'] .badge");
    await expect(badge).toContainText("Panela de Fogueira");
    await setLanguage(page, "en");
    await expect(badge).toContainText("Campfire Pot");
    expect(errors).toEqual([]);
  });

  for (const width of [360, 390, 1280]) {
    test(`bait item pages without overlap at ${width}px`, async ({ page }) => {
      await boot(page, width, 900);
      for (const [id, query] of [
        ["cobblemon:poke_snack", "Poke Snack"],
        ["cobblemon:poke_bait", "Poke Bait"],
        ["minecraft:enchanted_golden_apple", "Enchanted Golden Apple"],
      ] as const) {
        await openItem(page, id, query);
        await settle(page);
        await expectNoOverlap(page, ".item-screen");
      }
    });
  }
});

// berry-mutations T1.5: conjuntos DERIVADOS dos 70 arquivos crus de berries do snapshot (LESSONS), nomes/rotas do
// items.json publicado. Headless, sem slowMo, sem esperas fixas.
const BERRIES_DIR = new URL("../../data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/berries/", import.meta.url);
type RawBerry = { spawnConditions?: unknown[]; mutations?: Record<string, string> };
function rawBerries(): Map<string, RawBerry> {
  const out = new Map<string, RawBerry>();
  for (const f of readdirSync(BERRIES_DIR).filter((x) => x.endsWith(".json"))) {
    out.set(`cobblemon:${f.replace(/\.json$/, "")}`, JSON.parse(readFileSync(new URL(f, BERRIES_DIR), "utf8")) as RawBerry);
  }
  return out;
}
type PubItem = { name: { pt: string; en: string }; obtain: { kind: string }[]; berry: unknown };
function publishedItems(): Record<string, PubItem> {
  const cur = JSON.parse(readFileSync(new URL("../../public/data/current.json", import.meta.url), "utf8")) as { datasetVersion: string };
  return JSON.parse(readFileSync(new URL(`../../public/data/${cur.datasetVersion}/items.json`, import.meta.url), "utf8")) as Record<string, PubItem>;
}
const obtainRowsOf = (page: Page) => page.locator(".item-obtain .ob-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-row")));
const NEW_OBTAIN_ROWS = ["berryWorld", "berryGrowth", "mutation"];

test.describe("berry-mutations: item page", () => {
  test("Lum (CA-01/CA-09): grouped pairs, chance with Surprise Mulch and mechanic in PT and EN", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openItem(page, "cobblemon:lum_berry", "Lum");
    const row = page.locator(".item-obtain [data-row='mutation']");
    await expect(row.locator(".ob-title")).toHaveText("Como cruzar");
    await expect(row.locator("[data-mut-fixed='cobblemon:oran_berry'] button[data-item]")).toHaveCount(6);
    await expect(row.locator(".mut-hint")).toHaveText("uma destas:");
    const chance = row.locator("[data-mut-chance]");
    await expect(chance).toContainText("12,5%");
    await expect(chance).toContainText("50% com");
    await expect(chance.locator("button[data-item='cobblemon:surprise_mulch']")).toContainText("Adubo Surpresa");
    expect((await chance.textContent())!.replace(/\s+/g, " ")).toContain("50% com Adubo Surpresa");
    await expect(row.locator(".mut-how")).toContainText("diagonal");
    await expect(row.locator(".ob-more, .mon-chip, .tag")).toHaveCount(0);
    await setLanguage(page, "en");
    await page.locator("[data-tcard='itempage'] [data-tl='en']").click();
    await expect(row.locator(".ob-title")).toHaveText("How to crossbreed");
    await expect(chance).toContainText("12.5%");
    await expect(chance).toContainText("50% with");
    await expect(chance.locator("button[data-item='cobblemon:surprise_mulch']")).toContainText("Surprise Mulch");
    await expect(row.locator("button[data-item='cobblemon:oran_berry']")).toContainText("Oran Berry");
    await setLanguage(page, "pt");
    await page.locator("[data-tcard='itempage'] [data-tl='pt']").click();
    expect(errors).toEqual([]);
  });

  test("Figy one pair (CA-02); Oran + Cheri once per page (CA-03); Cheri, Red Apricorn and Adamant Mint without the row (CA-08)", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openItem(page, "cobblemon:figy_berry", "Figy");
    await expect(page.locator("[data-row='mutation'] .mut-pair")).toHaveCount(1);
    await expect(page.locator("[data-mut-fixed='cobblemon:cheri_berry'] button[data-item='cobblemon:persim_berry']")).toHaveCount(1);
    await expect(page.locator("[data-row='mutation'] .mut-hint")).toHaveCount(0);
    await openItem(page, "cobblemon:lum_berry", "Lum");
    await expect(page.locator(".item-obtain [data-row='mutation'] button[data-item='cobblemon:cheri_berry']")).toHaveCount(1);
    await openItem(page, "cobblemon:oran_berry", "Oran");
    await expect(page.locator(".item-used [data-mut-result='cobblemon:lum_berry'] button[data-item='cobblemon:cheri_berry']")).toHaveCount(1);
    await openItem(page, "cobblemon:cheri_berry", "Cheri");
    await expect(page.locator(".item-used [data-mut-result='cobblemon:lum_berry'] button[data-item='cobblemon:oran_berry']")).toHaveCount(1);
    for (const [id, q] of [
      ["cobblemon:cheri_berry", "Cheri"],
      ["cobblemon:red_apricorn", "Red Apricorn"],
      ["cobblemon:adamant_mint", "Adamant Mint"],
    ] as const) {
      await openItem(page, id, q);
      await expect(page.locator("[data-row='mutation']")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });

  test("Starf -> Pomeg -> Sitrus -> Lum -> Oran and back step by step (CA-04)", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openItem(page, "cobblemon:starf_berry", "Starf");
    for (const c of ["pomeg", "sitrus", "lum", "oran"]) {
      await page.locator(`.item-obtain [data-row='mutation'] button[data-item='cobblemon:${c}_berry']`).first().click();
      await expect(page.locator(`.item-body[data-item="cobblemon:${c}_berry"] .item-hero`)).toBeVisible();
      await expect(page.locator(".item-obtain [data-row='mutation']")).toHaveCount(c === "oran" ? 0 : 1);
    }
    await expect(page.locator(".item-obtain [data-row='berryWorld']")).toHaveCount(1);
    for (const c of ["lum", "sitrus", "pomeg", "starf"]) {
      await page.goBack();
      await expect(page.locator(`.item-body[data-item="cobblemon:${c}_berry"] .item-hero`)).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  for (const width of [360, 390]) {
    test(`Enigma with all partners visible, no overlap and no horizontal scroll at ${width}px (CA-05)`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width, 900);
      await openItem(page, "cobblemon:enigma_berry", "Enigma");
      await settle(page);
      const btns = page.locator(".item-obtain [data-row='mutation'] [data-mut-fixed='cobblemon:hopo_berry'] button[data-item]");
      await expect(btns).toHaveCount(19);
      for (const b of await btns.all()) await expect(b).toBeVisible();
      await expect(page.locator("[data-row='mutation'] .ob-more")).toHaveCount(0);
      await expectNoOverlap(page, ".item-screen");
      expect(await page.locator("#main").evaluate((m) => m.scrollWidth <= m.clientWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }

  test("Liechi world + mutation (CA-06/CA-14), Eggant only gains growth + mutation (CA-07), apricorn and mint keep Plantavel (CA-16)", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    const items = publishedItems();
    await boot(page);
    await openItem(page, "cobblemon:liechi_berry", "Liechi");
    await expect(page.locator("[data-row='berryWorld']")).toContainText("Mirage Ilha");
    await expect(page.locator("[data-row='mutation'] [data-mut-fixed='cobblemon:kelpsy_berry'] button[data-item='cobblemon:pamtre_berry']")).toHaveCount(1);
    await openItem(page, "cobblemon:eggant_berry", "Eggant");
    const eggantBefore = items["cobblemon:eggant_berry"]!.obtain.map((r) => r.kind).filter((k) => k !== "none" && k !== "plantable");
    expect(await obtainRowsOf(page)).toEqual([...eggantBefore, "berryGrowth", "mutation"]);
    for (const [id, q] of [
      ["cobblemon:red_apricorn", "Red Apricorn"],
      ["cobblemon:adamant_mint", "Adamant Mint"],
    ] as const) {
      await openItem(page, id, q);
      expect(await obtainRowsOf(page)).toEqual(items[id]!.obtain.map((r) => r.kind).filter((k) => k !== "none"));
      await expect(page.locator("[data-row='plantable'] .ob-title")).toHaveText("Plantável");
      await expect(page.locator("[data-row='plantable']")).toContainText("Pode ser plantado");
    }
    expect(errors).toEqual([]);
  });

  test("all 70 berries: mutation iff result, berryWorld iff spawn, berryGrowth always, mutationUses iff used (CA-10..CA-15, CA-20)", async ({ page }) => {
    test.setTimeout(DEV ? 900_000 : 300_000);
    const errors = trackConsoleErrors(page);
    const raw = rawBerries();
    const results = new Set<string>();
    const used = new Set<string>();
    for (const [id, b] of raw) {
      for (const [partner, result] of Object.entries(b.mutations ?? {})) {
        results.add(result);
        used.add(id);
        used.add(partner);
      }
    }
    const items = publishedItems();
    expect(raw.size).toBe(70);
    await boot(page);
    for (const id of [...raw.keys()].sort()) {
      await openItem(page, id, items[id]!.name.en);
      const rows = await obtainRowsOf(page);
      expect(rows.includes("mutation"), `${id} mutation`).toBe(results.has(id));
      expect(rows.includes("berryWorld"), `${id} berryWorld`).toBe((raw.get(id)!.spawnConditions ?? []).length > 0);
      expect(rows.includes("berryGrowth"), `${id} berryGrowth`).toBe(true);
      expect(rows.includes("plantable"), `${id} plantable`).toBe(false);
      expect(await page.locator(".item-used [data-row='mutationUses']").count(), `${id} mutationUses`).toBe(used.has(id) ? 1 : 0);
    }
    expect(errors).toEqual([]);
  });

  test("existing rows keep their relative order (CA-38): Occa, Fire Stone, Enchanted Golden Apple", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    const items = publishedItems();
    await boot(page);
    for (const [id, q] of [
      ["cobblemon:occa_berry", "Occa"],
      ["cobblemon:fire_stone", "fire stone"],
      ["minecraft:enchanted_golden_apple", "Enchanted Golden Apple"],
    ] as const) {
      await openItem(page, id, q);
      const it = items[id]!;
      const before = it.obtain.map((r) => r.kind).filter((k) => k !== "none" && (it.berry === null || k !== "plantable"));
      const rows = await obtainRowsOf(page);
      expect(rows.filter((r) => !NEW_OBTAIN_ROWS.includes(r!)), id).toEqual(before.length ? before : ["none"]);
      if (it.berry === null) expect(rows.some((r) => NEW_OBTAIN_ROWS.includes(r!)), id).toBe(false);
    }
    expect(await page.locator(".item-used [data-row='mutationUses']").count()).toBe(0);
    expect(errors).toEqual([]);
  });
});

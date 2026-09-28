// F8.1/F8.2: Treinadores com o dataset REAL (public/data/current.json), headless, sem slowMo, sem esperas fixas.
// Mode-agnostic: navegacao por interacao real de UI + IndexedDB direto (tests/e2e/idb-helpers.ts), roda em dev
// (PW_DEV=1) e em build+preview.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";
import { writeDoc } from "./idb-helpers";

const SHOTS = process.env.TRAINERS_SHOTS_DIR;

const ROARK = "gym_leader_roark_0395";
const MARS = "commander_mars_03c2";
const JUPITER = "commander_jupiter_041d";
const GARDENIA = "gym_leader_gardenia_03d6";
const CEDRIC = ["pokemon_trainer_cedric_0445", "pokemon_trainer_cedric_0446", "pokemon_trainer_cedric_0447"];
const MAYLENE = "gym_leader_maylene_03d8";

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

// Navegacao por interacao real de UI (sidebar no desktop, sheet "Mais" no mobile): funciona em dev e producao.
async function goTrainers(page: Page) {
  let link = page.locator('[data-nav="trainers"]:visible').first();
  if ((await link.count()) === 0) {
    await page.locator('[data-nav="more"]:visible').first().click();
    link = page.locator('[data-nav="trainers"]:visible').first();
  }
  await link.click();
}

async function openTrainers(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await goTrainers(page);
  await expect(page.locator(".trainers-screen")).toBeVisible();
  await expect(page.locator("#tr-series .seg-chip").first()).toBeVisible({ timeout: 30_000 });
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await page.locator(".tgl-lang:visible").first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

// Escreve o doc "trainerProgress" direto no IndexedDB (mesmo schema de src/storage/types.ts) em vez de chamar as
// acoes da store por import do Vite dev (so funciona com PW_DEV=1); funciona em dev e em build+preview.
async function seedDefeated(page: Page, ids: string[], active: string | null = "bdsp") {
  const defeated: Record<string, { at: number }> = {};
  ids.forEach((id, i) => (defeated[id] = { at: i + 1 }));
  await writeDoc(page, "trainerProgress", {
    schemaVersion: 1,
    activeSeriesId: active,
    freeroam: { active: false, pausedSeriesId: null },
    series: { bdsp: { defeated } },
  });
}

const cap = (page: Page) => page.getByTestId("tr-cap");
const step = (page: Page, id: string) => page.locator(`.tr-step[data-trainer="${id}"]`);
const chip = (page: Page, id: string) => step(page, id).getByTestId("tr-capchip").locator("b");

async function defeat(page: Page, id: string) {
  await step(page, id).locator(".tr-check").click();
  await expect(step(page, id).locator(".tr-check input")).toBeChecked();
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test.describe("F8.1 series picker", () => {
  test("no series: notice and no trainers; atm_team and freeroam locked; choice persists on reload", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openTrainers(page);
    await expect(page.locator(".tr-choose")).toContainText("Escolha a série que você está acompanhando");
    await expect(page.locator(".tr-step")).toHaveCount(0);
    const atm = page.locator('.seg-chip[data-series="atm_team"]');
    await expect(atm).toHaveClass(/locked/);
    await expect(atm).toContainText("Requer: Diamante brilhante/Pérola reluzente");
    await expect(page.locator('.seg-chip[data-series="freeroam"]')).toHaveClass(/locked/);
    await atm.click({ force: true });
    await expect(page.locator(".tr-step")).toHaveCount(0);

    await page.locator('.seg-chip[data-series="bdsp"]').click();
    await expect(page.locator('.seg-chip[data-series="bdsp"]')).toHaveClass(/active/);
    await expect(cap(page)).toHaveText("15");
    await expect(page.locator(".tr-step")).toHaveCount(43);

    await page.reload();
    await openTrainers(page);
    await expect(page.locator('.seg-chip[data-series="bdsp"]')).toHaveClass(/active/);
    await expect(cap(page)).toHaveText("15");
    expect(errors).toEqual([]);
  });

  test("completing BDSP unlocks atm_team and freeroam; freeroam = cap 100 and leaving restores BDSP", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openTrainers(page);
    const ids = await page.evaluate(async () => {
      const r = await fetch("/data/current.json");
      const { datasetVersion } = (await r.json()) as { datasetVersion: string };
      const s = (await (await fetch(`/data/${datasetVersion}/series.json`)).json()) as { id: string; keyTrainerIds: string[] }[];
      return s.find((x) => x.id === "bdsp")!.keyTrainerIds;
    });
    await seedDefeated(page, ids);
    await expect(page.locator('.seg-chip[data-series="atm_team"]')).not.toHaveClass(/locked/);
    await expect(page.locator('.seg-chip[data-series="bdsp"]')).toHaveAttribute("title", "Série concluída");
    const free = page.locator('.seg-chip[data-series="freeroam"]');
    await expect(free).not.toHaveClass(/locked/);
    await free.click();
    await expect(free).toHaveClass(/active/);
    await expect(cap(page)).toHaveText("100");
    await expect(page.locator(".tr-step")).toHaveCount(0);
    await page.reload();
    await openTrainers(page);
    await expect(cap(page)).toHaveText("100");
    await page.locator('.seg-chip[data-series="freeroam"]').click();
    await expect(page.locator('.seg-chip[data-series="bdsp"]')).toHaveClass(/active/);
    await expect(page.locator(".tr-step")).toHaveCount(43);
    expect(errors).toEqual([]);
  });
});

test.describe("F8.2 timeline and live level cap", () => {
  test("BDSP cap: 15, Roark 16, Mars 20, Jupiter 22, 3 Cedric next at 22, one Cedric 22, all 3 then Maylene 30", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openTrainers(page);
    await page.locator('.seg-chip[data-series="bdsp"]').click();
    await expect(cap(page)).toHaveText("15");
    await expect(step(page, ROARK)).toHaveAttribute("data-state", "next");
    // chip "Cap -> N" = cap alcancado APOS derrotar o treinador (decisao do Pontin 2026-09-26), nao o nivel do time
    await expect(chip(page, ROARK)).toHaveText("16");
    await expect(chip(page, MARS)).toHaveText("20");
    await expect(chip(page, JUPITER)).toHaveText("22");
    await expect(chip(page, GARDENIA)).toHaveText("22");
    for (const [i, n] of ["22", "22", "30"].entries()) await expect(chip(page, CEDRIC[i]!)).toHaveText(n);
    await expect(page.locator(".tr-step").last().getByTestId("tr-capchip").locator("b")).toHaveText("100");
    await defeat(page, ROARK);
    await expect(cap(page)).toHaveText("16");
    await defeat(page, MARS);
    await expect(cap(page)).toHaveText("20");
    await defeat(page, JUPITER);
    await expect(cap(page)).toHaveText("22");
    await defeat(page, GARDENIA);
    await expect(cap(page)).toHaveText("22");
    for (const id of CEDRIC) await expect(step(page, id)).toHaveAttribute("data-state", "next");
    await expect(page.getByTestId("tr-next")).toHaveText("Próximo: Pokémon Trainer Cedric, Pokémon Trainer Cedric, Pokémon Trainer Cedric");
    await expect(step(page, MAYLENE)).toHaveAttribute("data-state", "locked");
    await defeat(page, CEDRIC[0]!);
    await expect(cap(page)).toHaveText("22");
    await defeat(page, CEDRIC[1]!);
    await defeat(page, CEDRIC[2]!);
    await expect(cap(page)).toHaveText("30");
    await expect(page.getByTestId("tr-count")).toHaveText("7 de 43 treinadores-chave derrotados");
    await expect(chip(page, MAYLENE)).toHaveText("30");

    // desmarcar do meio: Jupiter fica derrotado mas bloqueado, o cap desce
    await step(page, MARS).locator(".tr-check").click();
    await expect(cap(page)).toHaveText("16");
    await expect(step(page, JUPITER)).toHaveClass(/blocked/);
    await expect(step(page, JUPITER).locator(".tr-check input")).toBeChecked();
    expect(errors).toEqual([]);
  });

  test("accordion shows the full team, spawn item and bag; item opens the item page", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openTrainers(page);
    await seedDefeated(page, []);
    await step(page, ROARK).locator(".tr-toggle").click();
    const body = step(page, ROARK).locator(".tr-body");
    await expect(body.locator(".tr-mon")).toHaveCount(3);
    await expect(body.locator(".tr-mon").first()).toContainText("Geodude");
    await expect(body.locator(".tr-mon").first().locator(".chip")).toHaveCount(2);
    await expect(body.locator(".tr-mon").first()).toContainText("Cabeça de Pedra");
    await expect(body.locator(".tr-mon").first()).toContainText("Pedra Oculta");
    await expect(body.locator(".tr-spawn-chip")).toContainText("Rocha Lisa");
    await expect(body.locator(".tr-spawn-chip img")).toHaveJSProperty("complete", true);
    expect(await body.locator(".tr-spawn-chip img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await expect(body.locator(".tr-foot .biome-item")).toContainText("x1");
    await expect(step(page, ROARK).locator(".tr-where .biome").first()).toHaveText("Caverna");
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/trainers-expanded-1280.png`, fullPage: false });
    // termos em EN pelo toggle do card, UI continua em PT
    await page.locator('.terms-tgl[data-tcard="trainers"] [data-tl="en"]').click();
    await expect(body.locator(".tr-mon").first()).toContainText("Rock Head");
    await expect(page.locator(".tr-cap-k")).toHaveText("Seu cap atual");
    await body.locator(".tr-spawn-chip").click();
    await expect(page.locator(".screen[data-screen='item']")).toBeVisible();
    await page.goBack();
    await expect(step(page, ROARK)).toHaveClass(/open/);
    expect(errors).toEqual([]);
  });

  test("search filters display only (PT and EN), empty state, restores on back and clear", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openTrainers(page);
    await seedDefeated(page, [ROARK]);
    await expect(cap(page)).toHaveText("16");
    const input = page.locator("#tr-q");
    await input.fill("roark");
    await expect(page.locator(".tr-step")).toHaveCount(1);
    await expect(step(page, ROARK)).toBeVisible();
    await expect(cap(page)).toHaveText("16");
    await expect(page.getByTestId("tr-count")).toHaveText("1 de 43 treinadores-chave derrotados");

    await input.fill("garchomp");
    await expect(page.locator(".tr-step").first()).toBeVisible();
    const n = await page.locator(".tr-step").count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(43);
    await expect(cap(page)).toHaveText("16");

    await input.fill("equipe galactica");
    await expect(step(page, MARS)).toBeVisible();

    await input.fill("zzzzqq");
    await expect(page.locator(".trainers-screen .empty-state")).toContainText("Nenhum treinador encontrado para");
    await expect(page.locator(".trainers-screen .empty-state")).toContainText('"zzzzqq"');

    await input.fill("roark");
    await expect(page.locator(".tr-step")).toHaveCount(1);
    await page.locator('[data-nav="settings"]:visible').first().click();
    await page.goBack();
    await expect(page.locator("#tr-q")).toHaveValue("roark");
    await expect(page.locator(".tr-step")).toHaveCount(1);

    await page.locator(".list-search-clear").click();
    await expect(page.locator(".tr-step")).toHaveCount(43);
    expect(errors).toEqual([]);
  });
});

test.describe("F8 no overlap", () => {
  for (const lang of ["pt", "en"] as const) {
    for (const width of [360, 390, 1280]) {
      test(`trainers ${lang} ${width}px`, async ({ page }) => {
        const errors = trackConsoleErrors(page);
        await openTrainers(page, width, 800);
        await setLanguage(page, lang);
        await seedDefeated(page, [ROARK, MARS]);
        await step(page, JUPITER).locator(".tr-toggle").click();
        await expect(step(page, JUPITER).locator(".tr-mon").first()).toBeVisible();
        await page.locator("#tr-q").fill("");
        await expectNoOverlap(page, ".trainers-screen .tr-top");
        await expectNoOverlap(page, "#tr-header");
        await expectNoOverlap(page, ".trainers-screen .tr-search");
        for (const id of [ROARK, MARS, JUPITER, GARDENIA, MAYLENE]) await expectNoOverlap(page, step(page, id).locator(".tr-card"));
        await page.locator("#tr-q").fill("zzzzqq");
        await expectNoOverlap(page, ".trainers-screen .empty-state");
        if (SHOTS) await page.screenshot({ path: `${SHOTS}/trainers-${lang}-${width}.png`, fullPage: false });
        expect(errors).toEqual([]);
      });
    }
  }
});

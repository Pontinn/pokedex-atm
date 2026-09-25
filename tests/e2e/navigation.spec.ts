// T1 (Sprint T1, matriz "navigation.spec.ts"): pilha de navegacao com o dataset REAL, headless, sem slowMo, sem
// esperas fixas. Os casos "Charizard > TM/Mega-X > item > Voltar (clique real)" e "Dex filtro + scroll > ficha >
// Voltar" ja estao cobertos com clique real em tests/e2e/detail.spec.ts ("Charizard Mega X: ...") e
// tests/e2e/dex.spec.ts ("text, filters and scroll are restored after Back"). Este arquivo cobre o que faltava:
// profundidade de pilha (Pokemon > item > Pokemon > item, sempre navegando pra frente, depois Voltar 3x) e
// Alt+Seta-Esquerda como atalho de Voltar (RF-04).
import { expect, test, type Page } from "@playwright/test";

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
  if (!(await page.locator(".home-screen").isVisible().catch(() => false))) {
    await page.locator('[data-nav="home"]:visible').first().click();
    await expect(page.locator(".home-screen")).toBeVisible();
  }
  await page.locator("#search-input").fill(String(dex));
  const item = page.locator(`.search-dd .dd-item[data-dex='${dex}']`);
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator(`.detail-screen[data-dex='${dex}'] .hero-card`)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/") || url.pathname.startsWith("/assets/cries/"), (route) =>
    route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }),
  );
});

test.describe("navigation depth and shortcuts", () => {
  test("Pokemon > item > Pokemon > item, always forward, then Back x3 unwinds the whole stack", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    // Eevee (133) -> clica no item de evolucao (Pedra de Fogo, evolui pra Flareon/136) -> tela de item
    await openDetail(page, 133);
    const fireStone = page.locator("#evo-panel .evo-branch[data-to='136'] .evo-item");
    await expect(fireStone).toBeVisible();
    await fireStone.click();
    await expect(page.locator("[data-screen='item']")).toBeVisible();
    const itemEntry1 = await page.locator(".screen[data-screen='item']").getAttribute("data-entry-id");
    // da tela de item, clica no chip de outra especie que tambem usa a pedra (Vulpix/37) -> ficha do Vulpix
    const evoRow = page.locator(".item-used .ob-row[data-row='evolutions']");
    await expect(evoRow).toBeVisible();
    await evoRow.locator(".mon-chip[data-dex='37']").click();
    await expect(page.locator(".detail-screen[data-dex='37'] .hero-card")).toBeVisible();
    // do Vulpix, clica de novo no item de evolucao (a mesma pedra, agora evoluindo pra Ninetales/38) -> tela de item
    // (Vulpix so tem 1 evolucao: cadeia LINEAR, ".evo-chain", nao ".evo-branch" como o Eevee acima)
    const fireStone2 = page.locator("#evo-panel .evo-chain .evo-item[data-item='cobblemon:fire_stone']");
    await expect(fireStone2).toBeVisible();
    await fireStone2.click();
    await expect(page.locator("[data-screen='item']")).toBeVisible();
    const itemEntry2 = await page.locator(".screen[data-screen='item']").getAttribute("data-entry-id");
    expect(itemEntry2).not.toBe(itemEntry1);
    // desfaz a pilha: item(2) -> Vulpix -> item(1) -> Eevee
    await page.goBack();
    await expect(page.locator(".detail-screen[data-dex='37'] .hero-card")).toBeVisible();
    await page.goBack();
    await expect(page.locator("[data-screen='item']")).toBeVisible();
    await expect(page.locator(".screen[data-screen='item']")).toHaveAttribute("data-entry-id", itemEntry1 ?? "");
    await page.goBack();
    await expect(page.locator(".detail-screen[data-dex='133'] .hero-card")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Alt+ArrowLeft goes back like the Voltar button", async ({ page }) => {
    await boot(page);
    await openDetail(page, 25);
    await expect(page.locator(".detail-screen[data-dex='25']")).toBeVisible();
    await page.keyboard.press("Alt+ArrowLeft");
    await expect(page.locator(".home-screen")).toBeVisible();
  });
});

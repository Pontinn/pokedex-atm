// Harness da Onda 1b (F1.1-F1.3): headless, sem slowMo, sem timers (auto-waiting / expect.poll).
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

interface ExpectedTokens {
  themes: Record<string, Record<string, string>>;
}

const expected = JSON.parse(
  readFileSync(new URL("../fixtures/ui-foundation/expected-tokens.json", import.meta.url), "utf8"),
) as ExpectedTokens;
const typeColors = JSON.parse(readFileSync(new URL("../../design/tipos/cores.json", import.meta.url), "utf8")) as Record<
  string,
  { base: string; a: string; b: string }
>;

/** Normaliza para comparar valores de custom properties (caixa e espacos). */
const norm = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "");

async function openHarness(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/tests/harness/foundation.html");
  await expect(page.getByTestId("tokens-card")).toBeVisible();
  return errors;
}

test.describe("F1.1 tokens e temas", () => {
  test("cada tema de THEME_IDS devolve os tokens do UISPEC 3.3", async ({ page }) => {
    const errors = await openHarness(page);
    const themeIds = await page.evaluate(() => [...window.__themeIds]);
    expect(themeIds.sort()).toEqual(Object.keys(expected.themes).sort());

    for (const themeId of themeIds) {
      const tokens = expected.themes[themeId]!;
      const names = Object.keys(tokens);
      const actual = await page.evaluate(
        ({ id, props }) => {
          window.__applyTheme(id);
          const cs = getComputedStyle(document.documentElement);
          return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
        },
        { id: themeId, props: names },
      );
      for (const name of names) {
        expect.soft(norm(actual[name] ?? ""), `${themeId} ${name}`).toBe(norm(tokens[name]!));
      }
      const theme = await page.evaluate(() => document.documentElement.dataset.theme);
      expect(theme).toBe(themeId);
    }
    expect(errors).toEqual([]);
  });

  test("black tem cards #111111 e scroll-thumb amarelo", async ({ page }) => {
    await openHarness(page);
    const values = await page.evaluate(() => {
      window.__applyTheme("black");
      const cs = getComputedStyle(document.documentElement);
      const card = getComputedStyle(document.querySelector("[data-testid=tokens-card]")!);
      return {
        surface: cs.getPropertyValue("--surface"),
        thumb: cs.getPropertyValue("--scroll-thumb"),
        cardBg: card.backgroundColor,
        mainBg: getComputedStyle(document.getElementById("main")!).backgroundColor,
      };
    });
    expect(norm(values.surface)).toBe("#111111");
    expect(norm(values.thumb)).toBe("#f5c518");
    expect(values.cardBg).toBe("rgb(17, 17, 17)");
    // RF-120: fundo da area de conteudo = --screen do black (#2A2410)
    expect(values.mainBg).toBe("rgb(42, 36, 16)");
  });

  test("id desconhecido cai para classic", async ({ page }) => {
    await openHarness(page);
    const theme = await page.evaluate(() => {
      window.__applyTheme("inexistente");
      return document.documentElement.dataset.theme;
    });
    expect(theme).toBe("classic");
  });

  test(".t-fire usa a cor base de fogo de cores.json e o chip carrega o icone", async ({ page }) => {
    await openHarness(page);
    const chip = page.locator(".chip.t-fire").first();
    await expect(chip).toBeVisible();
    const tc = await chip.evaluate((el) => getComputedStyle(el).getPropertyValue("--tc"));
    expect(norm(tc)).toBe(norm(typeColors.fire!.base));
    await expect(chip).toContainText("Fogo");
    const img = chip.locator(".ti img");
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });

  test("marca d'agua usa mask-image com pokeball-mask", async ({ page }) => {
    await openHarness(page);
    const wm = page.locator(".watermark");
    const style = await wm.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        mask: cs.getPropertyValue("mask-image") || cs.getPropertyValue("-webkit-mask-image"),
        animation: cs.animationName,
        opacity: cs.opacity,
      };
    });
    expect(style.mask).toContain("pokeball-mask");
    expect(style.animation).toBe("wmSpin");
    expect(style.opacity).toBe("0.03");
    // a mascara resolve (nenhum 404)
    const maskUrl = style.mask.match(/url\("?([^")]+)"?\)/)?.[1];
    expect(maskUrl).toBeTruthy();
    const res = await page.request.get(maskUrl!);
    expect(res.ok()).toBe(true);
  });
});

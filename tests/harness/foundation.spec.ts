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

test.describe("F1.3 pilha de navegacao (telas ficticias)", () => {
  const mainScroll = (page: Page) => page.evaluate(() => document.getElementById("main")!.scrollTop);
  const scrollMainTo = async (page: Page, top: number) => {
    await page.evaluate((y) => document.getElementById("main")!.scrollTo({ top: y, behavior: "instant" }), top);
    await expect.poll(() => mainScroll(page)).toBe(top);
  };

  test("navegar, rolar 800 px, navegar e voltar (popstate e Alt+Seta) restaura o scroll", async ({ page }) => {
    const errors = await openHarness(page);
    await expect(page.getByTestId("dummy-home")).toBeVisible();

    await page.getByTestId("go-dex").click();
    await expect(page.getByTestId("dummy-dex")).toBeVisible();
    await scrollMainTo(page, 800);

    await page.getByTestId("dummy-dex").getByTestId("go-detail").dispatchEvent("click");
    await expect(page.getByTestId("dummy-detail")).toBeVisible();
    await expect.poll(() => mainScroll(page)).toBe(0);

    // voltar do navegador (popstate)
    await page.goBack();
    await expect(page.getByTestId("dummy-dex")).toBeVisible();
    await expect.poll(async () => Math.abs((await mainScroll(page)) - 800)).toBeLessThanOrEqual(2);

    // de novo para a ficha, rolar, e voltar com Alt+Seta esquerda
    // (dispatchEvent: o clique nao rola o #main ate o botao, para o scroll salvo ser exatamente o rolado)
    await page.getByTestId("dummy-dex").getByTestId("go-detail").dispatchEvent("click");
    await expect(page.getByTestId("dummy-detail")).toBeVisible();
    await scrollMainTo(page, 450);
    await page.getByTestId("dummy-detail").getByTestId("go-balls").dispatchEvent("click");
    await expect(page.getByTestId("dummy-balls")).toBeVisible();
    await page.keyboard.press("Alt+ArrowLeft");
    await expect(page.getByTestId("dummy-detail")).toBeVisible();
    await expect.poll(async () => Math.abs((await mainScroll(page)) - 450)).toBeLessThanOrEqual(2);

    // Voltar do app (goBack(false)) volta uma tela so e restaura o scroll
    await page.getByTestId("dummy-detail").getByTestId("app-back").dispatchEvent("click");
    await expect(page.getByTestId("dummy-dex")).toBeVisible();
    await expect.poll(async () => Math.abs((await mainScroll(page)) - 800)).toBeLessThanOrEqual(2);
    await page.getByTestId("dummy-dex").getByTestId("app-back").dispatchEvent("click");
    await expect(page.getByTestId("dummy-home")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("toggle de termos e titulo nao se sobrepoem no card (PT, 360/390/1280 px)", async ({ page }) => {
    await openHarness(page);
    const card = page.getByTestId("dummy-home");
    for (const width of [360, 390, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      const boxes = await card.evaluate((el) => {
        const title = el.querySelector("h2")!.getBoundingClientRect();
        const toggle = el.querySelector(".terms-tgl")!.getBoundingClientRect();
        return { title: title.toJSON(), toggle: toggle.toJSON() };
      });
      const a = boxes.title as DOMRect;
      const b = boxes.toggle as DOMRect;
      const overlap = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      expect(overlap, `overlap at ${width}px`).toBe(false);
    }
  });
});

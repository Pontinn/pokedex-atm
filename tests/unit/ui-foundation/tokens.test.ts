import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_IDS } from "../../../src/styles/themes";
import { THEMES, applyTheme, isThemeId, normalizeThemeId } from "../../../src/styles/theme-meta";

const css = (name: string) => readFileSync(resolve(process.cwd(), "src/styles", name), "utf8");

describe("F1.1 applyTheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete document.documentElement.dataset.theme;
  });

  it("aplica cada id valido no <html>", () => {
    for (const id of THEME_IDS) {
      expect(applyTheme(id)).toBe(id);
      expect(document.documentElement.dataset.theme).toBe(id);
    }
  });

  it('id inexistente vira "classic" com aviso', () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(applyTheme("inexistente")).toBe("classic");
    expect(document.documentElement.dataset.theme).toBe("classic");
    expect(warn).toHaveBeenCalledOnce();
  });

  it("isThemeId/normalizeThemeId", () => {
    expect(isThemeId("black")).toBe(true);
    expect(isThemeId("preto")).toBe(false);
    expect(isThemeId(3)).toBe(false);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(normalizeThemeId("preto")).toBe("classic");
  });
});

describe("F1.1 THEMES e CSS", () => {
  it("THEMES cobre exatamente THEME_IDS", () => {
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_IDS].sort());
  });

  it("themes.css tem um bloco por id de THEME_IDS e nenhum id em portugues", () => {
    const themes = css("themes.css");
    const ids = [...themes.matchAll(/html\[data-theme="([a-z]+)"\]/g)].map((m) => m[1]);
    expect(ids).toEqual([...THEME_IDS]);
    expect(themes).not.toMatch(/data-theme="(classico|preto|verde|azul|roxo|branco|laranja)"/);
  });

  it("nenhum arquivo de estilo alem de types.generated.css declara cor de tipo (RF-117)", () => {
    for (const file of ["tokens.css", "themes.css", "base.css", "components.css"]) {
      expect(css(file), file).not.toMatch(/--t-[a-z]+\s*:|--type-[a-z]+-[ab]\s*:/);
    }
  });
});

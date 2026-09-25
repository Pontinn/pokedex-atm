// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { itemTextureUrl } from "../../../src/components/ItemTile";

const PUBLIC = new URL("../../../public/", import.meta.url);
const hasData = existsSync(new URL("data/current.json", PUBLIC));

describe("itemTextureUrl", () => {
  it("textura do dataset (assets/items/...) nao dobra o prefixo", () => {
    expect(itemTextureUrl("assets/items/cobblemon/potion.png")).toBe("/assets/items/cobblemon/potion.png");
  });
  it("caminho curto legado e absoluto continuam validos", () => {
    expect(itemTextureUrl("cobblemon/potion.png")).toBe("/assets/items/cobblemon/potion.png");
    expect(itemTextureUrl("/assets/items/cobblemon/potion.png")).toBe("/assets/items/cobblemon/potion.png");
  });
  it("sem textura = null", () => {
    expect(itemTextureUrl(null)).toBeNull();
    expect(itemTextureUrl(undefined)).toBeNull();
    expect(itemTextureUrl("")).toBeNull();
  });

  it.skipIf(!hasData)("toda textura do items.json publicado aponta para um arquivo existente em public/", () => {
    const { datasetVersion } = JSON.parse(readFileSync(new URL("data/current.json", PUBLIC), "utf8"));
    const items = JSON.parse(readFileSync(new URL(`data/${datasetVersion}/items.json`, PUBLIC), "utf8")) as Record<
      string,
      { texture: string | null }
    >;
    const textures = Object.values(items).map((i) => i.texture).filter((t): t is string => !!t);
    expect(textures.length).toBeGreaterThan(0);
    const missing = textures.filter((t) => !existsSync(new URL(itemTextureUrl(t)!.slice(1), PUBLIC)));
    expect(missing).toEqual([]);
  });
});

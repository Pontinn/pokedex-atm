// U3 (pwa-auto-update): cache busting dos caminhos de asset gravados no dataset.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { stripAssetVersion, versionStagedAsset, withAssetVersion } from "../../../tools/dataset/src/media/asset-version";
import { sha256Hex } from "../../../tools/dataset/src/lib/hash";

const tmp = path.resolve(import.meta.dirname, "../../../tools/dataset/out/_asset-version-test");
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("asset version query (U3)", () => {
  it("appends ?v=<first 8 hex of sha256 of the bytes>, deterministic for the same bytes", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const v = withAssetVersion("assets/items/allthemons/the_kitty_badge.png", bytes);
    expect(v).toBe(`assets/items/allthemons/the_kitty_badge.png?v=${sha256Hex(bytes).slice(0, 8)}`);
    expect(withAssetVersion("assets/items/allthemons/the_kitty_badge.png", new Uint8Array([1, 2, 3]))).toBe(v);
  });

  it("changes the query when the bytes change and keeps the file path", () => {
    const a = withAssetVersion("assets/items/a.png", new Uint8Array([1]));
    const b = withAssetVersion("assets/items/a.png", new Uint8Array([2]));
    expect(a).not.toBe(b);
    expect(stripAssetVersion(a)).toBe("assets/items/a.png");
    expect(stripAssetVersion(b)).toBe("assets/items/a.png");
  });

  it("refuses a path that already has a query", () => {
    expect(() => withAssetVersion("assets/items/a.png?v=deadbeef", new Uint8Array([1]))).toThrow();
  });

  it("versions a staged file by its bytes and reports a missing file without a query", () => {
    mkdirSync(path.join(tmp, "assets/items/ns"), { recursive: true });
    writeFileSync(path.join(tmp, "assets/items/ns/x.png"), Buffer.from([9, 9]));
    const found = versionStagedAsset(tmp, "assets/items/ns/x.png");
    expect(found).toEqual({ path: `assets/items/ns/x.png?v=${sha256Hex(new Uint8Array([9, 9])).slice(0, 8)}`, missing: false });
    expect(versionStagedAsset(tmp, "assets/items/ns/missing.png")).toEqual({ path: "assets/items/ns/missing.png", missing: true });
  });
});

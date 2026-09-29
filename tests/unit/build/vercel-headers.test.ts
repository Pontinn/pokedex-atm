// U11 (pwa-auto-update): current.json nunca immutable; pastas versionadas e /assets/ immutable.
// Cada caminho casa com UMA regra so (sem depender da precedencia do Vercel entre regras).
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToRegexp } from "path-to-regexp";
import { describe, expect, it } from "vitest";

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}
const vercel = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "../../../vercel.json"), "utf8")) as { headers: HeaderRule[] };

function cacheControl(p: string): string[] {
  return vercel.headers
    .filter((r) => pathToRegexp(r.source).test(p))
    .flatMap((r) => r.headers.filter((h) => h.key.toLowerCase() === "cache-control").map((h) => h.value));
}

describe("vercel.json Cache-Control (U11)", () => {
  it("serves /data/current.json with no-cache only", () => {
    expect(cacheControl("/data/current.json")).toEqual(["no-cache"]);
  });
  it("keeps versioned dataset folders and /assets/ immutable", () => {
    const immutable = ["public, max-age=31536000, immutable"];
    expect(cacheControl("/data/atm1.3.0-cobblemon1.7.3-20260928-abcdef01/items.json")).toEqual(immutable);
    expect(cacheControl("/data/atm1.3.0-cobblemon1.7.3-20260928-abcdef01/species/1.json")).toEqual(immutable);
    expect(cacheControl("/assets/index-abc.js")).toEqual(immutable);
  });
  it("keeps sw.js no-cache", () => {
    expect(cacheControl("/sw.js")).toEqual(["no-cache"]);
  });
  it("keeps the script imported by sw.js no-cache (sw-legacy-button)", () => {
    expect(cacheControl("/sw-skip-waiting.js")).toEqual(["no-cache"]);
  });
});

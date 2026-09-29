// U11 (pwa-auto-update): datasetVersion pelo hash do conteudo de TODOS os arquivos do dataset.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { DatasetManifest } from "../../../src/data/types";
import {
  buildDatasetVersion,
  datasetContentHash,
  listDatasetFiles,
  type ManifestContent,
} from "../../../tools/dataset/src/lib/dataset-version";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const tmp = path.join(ROOT, "tools/dataset/out/_dataset-version-test");
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const manifestContent = { pack: { version: "1.3.0" }, counts: { species: 2 }, files: { items: "items.json" } } as unknown as ManifestContent;

function makeDataset(name: string, files: Record<string, string>): string {
  const dir = path.join(tmp, name);
  rmSync(dir, { recursive: true, force: true });
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), text);
  }
  return dir;
}

const BASE = {
  "species-index.json": '[{"dex":1}]',
  "items.json": '{"a":{"obtain":[]}}',
  "series.json": "[]",
  "species/1.json": '{"dex":1}',
  "trainers/radicalred.json": "[]",
};

describe("datasetVersion by content hash (U11)", () => {
  beforeEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("same content = same hash (idempotent), independent of folder and manifest volatile fields", () => {
    const a = makeDataset("a", { ...BASE, "dataset-manifest.json": '{"datasetVersion":"x","generatedAt":"1"}' });
    const b = makeDataset("b", { ...BASE, "dataset-manifest.json": '{"datasetVersion":"y","generatedAt":"2"}' });
    const h = datasetContentHash(a, manifestContent);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(datasetContentHash(a, manifestContent)).toBe(h);
    expect(datasetContentHash(b, manifestContent)).toBe(h);
    // ordem das chaves do manifest nao importa
    const reordered = { files: manifestContent.files, counts: manifestContent.counts, pack: manifestContent.pack } as unknown as ManifestContent;
    expect(datasetContentHash(b, reordered)).toBe(h);
    const day = new Date("2026-09-28T12:00:00Z");
    expect(buildDatasetVersion("1.3.0", "1.7.3", day, h)).toBe(buildDatasetVersion("1.3.0", "1.7.3", day, datasetContentHash(b, manifestContent)));
  });

  it("any content change = new hash (items.json only, series.json only, nested file, new file, rename, manifest)", () => {
    const h = datasetContentHash(makeDataset("base", BASE), manifestContent);
    const variants: Record<string, string>[] = [
      { ...BASE, "items.json": '{"a":{"obtain":[{"kind":"craftable"}]}}' },
      { ...BASE, "series.json": '[{"id":"atm_team"}]' },
      { ...BASE, "trainers/radicalred.json": '[{"id":"t"}]' },
      { ...BASE, "species/2.json": '{"dex":2}' },
      { ...Object.fromEntries(Object.entries(BASE).filter(([k]) => k !== "series.json")), "series2.json": "[]" },
    ];
    const seen = new Set([h]);
    variants.forEach((files, i) => {
      const v = datasetContentHash(makeDataset(`v${i}`, files), manifestContent);
      expect(seen.has(v)).toBe(false);
      seen.add(v);
    });
    const otherManifest = { ...manifestContent, counts: { species: 3 } } as unknown as ManifestContent;
    expect(datasetContentHash(makeDataset("m", BASE), otherManifest)).not.toBe(h);
  });

  it("the species index alone no longer decides the version (the U6 blocker)", () => {
    const a = makeDataset("same-index-a", BASE);
    const b = makeDataset("same-index-b", { ...BASE, "items.json": '{"a":{"obtain":[{"kind":"shop"}]}}' });
    expect(readFileSync(path.join(a, "species-index.json"), "utf8")).toBe(readFileSync(path.join(b, "species-index.json"), "utf8"));
    const day = new Date("2026-09-28T00:00:00Z");
    expect(buildDatasetVersion("1.3.0", "1.7.3", day, datasetContentHash(a, manifestContent))).not.toBe(
      buildDatasetVersion("1.3.0", "1.7.3", day, datasetContentHash(b, manifestContent)),
    );
  });

  it("keeps the atm<pack>-cobblemon<ver>-<yyyymmdd>-<hash8> format", () => {
    const v = buildDatasetVersion("1.3.0", "1.7.3", new Date("2026-09-28T23:59:00Z"), "abcdef0123456789");
    expect(v).toBe("atm1.3.0-cobblemon1.7.3-20260928-abcdef01");
  });

  it("lists files recursively in a deterministic order with / separators", () => {
    const dir = makeDataset("order", BASE);
    expect(listDatasetFiles(dir)).toEqual(["items.json", "series.json", "species-index.json", "species/1.json", "trainers/radicalred.json"]);
  });

  it("the published dataset folder is named by the hash of its own content", () => {
    const dataRoot = path.join(ROOT, "public/data");
    const { datasetVersion } = JSON.parse(readFileSync(path.join(dataRoot, "current.json"), "utf8")) as { datasetVersion: string };
    const dir = path.join(dataRoot, datasetVersion);
    const { datasetVersion: mv, generatedAt: _g, ...content } = JSON.parse(readFileSync(path.join(dir, "dataset-manifest.json"), "utf8")) as DatasetManifest;
    expect(mv).toBe(datasetVersion);
    // copia para fora de public/ e confere que o hash nao depende do lugar
    const copy = path.join(tmp, "published-copy");
    cpSync(dir, copy, { recursive: true });
    const hash = datasetContentHash(copy, content);
    expect(datasetVersion.endsWith(`-${hash.slice(0, 8)}`)).toBe(true);
  });
});

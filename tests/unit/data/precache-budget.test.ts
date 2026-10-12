// @vitest-environment node
// pokemon-generation T1.2 (RNF-01, CA-60): teto de crescimento do precache de DADOS do service worker.
// Metodo fixado na SPEC 2.3: soma de zlib.gzipSync(readFileSync(f)).length (Node 24, nivel padrao) sobre
// data/current.json + data/<datasetVersion>/{dataset-manifest,species-index,type-chart}.json (vite.config.ts).
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";

// Linha de base medida na Sprint 0 do pokemon-generation sobre atm1.3.0-cobblemon1.7.3-20260930-1949ea67 (o dataset
// publicado ANTES da feature). O teto de 10.240 bytes e relativo a essa linha de base: toda feature futura que
// republicar o dataset re-ancora BASELINE_GZIP na versao publicada antes dela.
const BASELINE_GZIP = { "current.json": 91, "dataset-manifest.json": 913, "species-index.json": 36200, "type-chart.json": 547 } as const;
const BASELINE_TOTAL = Object.values(BASELINE_GZIP).reduce((a, b) => a + b, 0);
const MAX_GROWTH_BYTES = 10_240;

const DATA = new URL("../../../public/data/", import.meta.url);
const gz = (url: URL) => gzipSync(readFileSync(url)).length;

describe("precache budget (pokemon-generation)", () => {
  it("the 4 precached dataset files grow at most 10,240 gzip bytes over the baseline", () => {
    expect(BASELINE_TOTAL).toBe(37_751);
    const { datasetVersion } = JSON.parse(readFileSync(new URL("current.json", DATA), "utf8")) as { datasetVersion: string };
    const sizes = {
      "current.json": gz(new URL("current.json", DATA)),
      ...Object.fromEntries(
        (["dataset-manifest.json", "species-index.json", "type-chart.json"] as const).map((f) => [f, gz(new URL(`${datasetVersion}/${f}`, DATA))]),
      ),
    };
    const total = Object.values(sizes).reduce((a, b) => a + b, 0);
    expect(total - BASELINE_TOTAL, JSON.stringify(sizes)).toBeLessThanOrEqual(MAX_GROWTH_BYTES);
  });

  it("vite.config.ts precaches exactly current.json and {dataset-manifest,species-index,type-chart} of the dataset (keep this list in sync)", () => {
    const config = readFileSync(new URL("../../../vite.config.ts", import.meta.url), "utf8");
    const dataGlobs = [...config.matchAll(/["`](data\/[^"`]+)["`]/g)].map((m) => m[1]);
    expect(dataGlobs).toEqual(["data/current.json", "data/${datasetVersion}/{dataset-manifest,species-index,type-chart}.json"]);
  });
});
